import logging
import os
from logging.handlers import TimedRotatingFileHandler
from datetime import datetime

class SafeTimedRotatingFileHandler(TimedRotatingFileHandler):
    def doRollover(self):
        """
        Override rollover to just switch to a new file without renaming the current one.
        """
        if self.stream:
            self.stream.close()
            self.stream = None

        # Create new filename based on date
        current_time = datetime.now().strftime("%Y-%m-%d")
        new_log_filename = os.path.join(
            os.path.dirname(self.baseFilename),
            f"app.log.{current_time}"
        )

        # Update baseFilename to the new file
        self.baseFilename = new_log_filename

        # Reopen stream for new log file
        self.stream = self._open()
        self.rolloverAt = self.computeRollover(int(datetime.now().timestamp()))

class Logger:
    _logger = None

    @staticmethod
    def get_logger(
        name="AppLogger",
        log_dir="logs",
        level=logging.INFO,
        when="midnight"
    ):
        if Logger._logger:
            return Logger._logger

        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        logger = logging.getLogger(name)
        logger.setLevel(level)
        logger.propagate = False

        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
        )

        # Set initial base filename, it will switch daily
        log_file_path = os.path.join(log_dir, "app.log")

        file_handler = SafeTimedRotatingFileHandler(
            filename=log_file_path,
            when=when,
            encoding="utf-8",
            delay=True  # Prevent early locking
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

        Logger._logger = logger
        return logger
