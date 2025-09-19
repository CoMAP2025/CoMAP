import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

export default function OperationTips() {
  const tips = [
    <> <strong style={{ marginRight: 4 }}>单击</strong>卡片和边编辑详情 </>,
    <> <strong style={{ marginRight: 4 }}>单击+DELETE键</strong>快速删除卡片和边 </>,
    <> <strong>CoMAP AI </strong>对话生成新增和修改卡片的建议 </>,
  ];

  return (
    <Card
      sx={{
        position: 'fixed',
        top: 80,
        right: 20,
        width: 340,
        zIndex: 1300,
        backgroundColor: 'rgba(255, 255, 255, 0.4)', // 轻微半透明
        borderRadius: 3,
        color: '#444',
        fontSize: 15,
        lineHeight: 1.6,
      }}
    //   elevation={4}
    >
      <CardContent sx={{ p: 0 }}>
        <List
          dense
          sx={{
            listStyleType: 'disc',
            pl: 4,
            '& .MuiListItem-root': {
              display: 'list-item',
              py: 0.8,
              color: '#555',
            },
            '& .MuiListItemText-root': {
              m: 0,
            },
          }}
        >
          {tips.map((tip, idx) => (
            <ListItem key={idx} disablePadding>
              <ListItemText primary={tip} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
