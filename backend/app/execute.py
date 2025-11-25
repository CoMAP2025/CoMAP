from concurrent.futures import ThreadPoolExecutor
from .services import *
from .models import *

GLOBAL_EXECUTOR = ThreadPoolExecutor(max_workers=GPT_MAX_CONCURRENT_REQUESTS)