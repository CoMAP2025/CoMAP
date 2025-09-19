import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  FormGroup, // 引入 FormGroup
  FormLabel, // 引入 FormLabel
} from '@mui/material';

const subjects = [
  '数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '信息技术', '艺术', '体育', '通用技术', '其他'
];

const declarationText = "我理解并承诺：任何带有创意和温度的教学设计都源于教育者的辛勤付出，不应过度依赖平台生成的内容。在设计过程中，我可能会遇到挑战和思维瓶颈。当这些困难出现时，我将积极采取行动来解决问题，包括但不限于：休息放松、将复杂问题分解、与他人讨论、查找资料等。我将以积极的心态面对整个创作过程。";

const CreateCanvasModal = ({ open, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [lessonCount, setLessonCount] = useState(1);
  const [lessonDuration, setLessonDuration] = useState(45);
  const [subjectsSelected, setSubjectsSelected] = useState([]); // 保持多选数组状态
  const [isAgreed, setIsAgreed] = useState(false);

  // 处理复选框变化的函数
  const handleSubjectChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSubjectsSelected((prev) => [...prev, value]);
    } else {
      setSubjectsSelected((prev) => prev.filter((subject) => subject !== value));
    }
  };

  const handleSubmit = () => {
    if (name.trim() === '' || subjectsSelected.length === 0 || !isAgreed) {
      alert('请填写画布名称、选择至少一个学科并同意声明！');
      return;
    }
    // 拼接成字符串传给后端
    const subjectString = subjectsSelected.join(',');
    onCreate({ name, lessonCount, lessonDuration, subject: subjectString });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        预设你的教学设计基础信息
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2, p: 1, backgroundColor: '#fff9e6', border: '1px solid #ffe0a3', borderRadius: '4px' }}>
          <Typography variant="body2" color="textSecondary">
            💡 这些信息在进入具体设计阶段后仍可修改，请放心填写。
          </Typography>
        </Box>
        <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            label="为你的教学设计起一个名字"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              margin="dense"
              id="lessonCount"
              label="总课时数"
              type="number"
              fullWidth
              variant="outlined"
              value={lessonCount}
              onChange={(e) => setLessonCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              margin="dense"
              id="lessonDuration"
              label="每节课时长 (分钟)"
              type="number"
              fullWidth
              variant="outlined"
              value={lessonDuration}
              onChange={(e) => setLessonDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Box>

          {/* 新的多选框组 */}
          <FormControl component="fieldset" margin="dense">
            <FormLabel component="legend">涉及的学科（可多选）</FormLabel>
            <FormGroup row sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
              {subjects.map((s) => (
                <FormControlLabel
                  key={s}
                  control={
                    <Checkbox
                      checked={subjectsSelected.includes(s)}
                      onChange={handleSubjectChange}
                      value={s}
                      size="small"
                    />
                  }
                  label={s}
                />
              ))}
            </FormGroup>
          </FormControl>

          <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              用户声明
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
              {declarationText}
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                color="primary"
              />
            }
            label={<Typography variant="body2" sx={{ color: isAgreed ? 'inherit' : '#f48fb1' }}>我已阅读并同意以上声明</Typography>}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="secondary">取消</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isAgreed || !name || subjectsSelected.length === 0}
        >
          开始
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateCanvasModal;