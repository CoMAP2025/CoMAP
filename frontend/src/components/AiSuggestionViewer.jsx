import React from 'react';
import { Box, Typography, Paper, Divider, Chip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// A small component to safely render the description, which may contain HTML
const DescriptionDisplay = ({ htmlContent, label, color }) => (
  <Box>
    <Chip label={label} color={color} size="small" sx={{ mb: 1 }} />
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        maxHeight: 300,
        overflowY: 'auto',
        backgroundColor: '#f5f5f5',
        '& *': { margin: 0 } // Reset margin for elements inside the description
      }}
      dangerouslySetInnerHTML={{ __html: htmlContent || '<i>(无内容)</i>' }}
    />
  </Box>
);

// Component to show a clear "before" and "after" for a single node update
const CompareNodeChanges = ({ originalData, suggestedData }) => (
  <Box>
    {/* Title comparison */}
    {originalData.title !== suggestedData.title && (
      <Box mb={2}>
        <Typography variant="overline" color="text.secondary">标题变更</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label="原" color="default" size="small" />
          <Typography variant="body1" sx={{ textDecoration: 'line-through' }}>
            {originalData.title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Chip label="新" color="primary" size="small" />
          <Typography variant="body1" fontWeight="bold">
            {suggestedData.title}
          </Typography>
        </Box>
      </Box>
    )}


    {/* Description comparison - Modified */}
    <Box>
      <Typography variant="overline" color="text.secondary">详情描述变更</Typography>
      <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 2, mt: 1 }}>
        <Box sx={{ flex: 1 }}>
          <DescriptionDisplay 
            label="原" 
            color="default" 
            htmlContent={originalData.description} 
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ArrowForwardIcon color="action" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <DescriptionDisplay 
            label="新" 
            color="primary" 
            htmlContent={suggestedData.description} 
          />
        </Box>
      </Box>
    </Box>
  </Box>
);

// Main viewer component that decides what to render based on the suggestion type
const AiSuggestionViewer = ({ suggestion, originalNodes }) => {
  const { changes, nodeId, action } = suggestion;

  // Case 1: A single node is being updated (refine, correct)
  if (changes.updateNode) {
    const originalNode = originalNodes.find(n => n.id === nodeId);
    if (!originalNode) return <Typography>错误：无法找到原始卡片进行对比。</Typography>;
    
    // Check if the description actually changed
    const isDescriptionChanged = originalNode.data.description !== changes.updateNode.data.description;

    return <CompareNodeChanges 
      originalData={originalNode.data} 
      suggestedData={changes.updateNode.data} 
      isDescriptionChanged={isDescriptionChanged}
    />;
  }

  // Case 2: New nodes are being created (split)
  if (changes.createNodes) {
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          AI 建议将原卡片分裂为 {changes.createNodes.length} 张新卡片：
        </Typography>
        {changes.createNodes.map((node, index) => (
          <Paper key={node.id || index} variant="outlined" sx={{ p: 2, mb: 1 }}>
            <Typography variant="body1" fontWeight="bold">{node.title}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {node.description.replace(/<[^>]*>?/gm, '')}
            </Typography>
          </Paper>
        ))}
      </Box>
    );
  }

  // Case 3: Multiple nodes are being updated (influence, sync)
  if (changes.updateNodes) {
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          AI 建议对 {changes.updateNodes.length} 张关联卡片进行如下同步更新：
        </Typography>
        {changes.updateNodes.map((node, index) => (
          <Paper key={node.id || index} variant="outlined" sx={{ p: 2, mb: 1 }}>
            <Typography variant="body1" fontWeight="bold">{node.data.title}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {node.data.description.replace(/<[^>]*>?/gm, '')}
            </Typography>
          </Paper>
        ))}
      </Box>
    );
  }

  // Fallback case
  return <Typography>无可用预览。</Typography>;
};

export default AiSuggestionViewer;