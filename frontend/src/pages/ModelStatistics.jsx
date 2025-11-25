import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import "./ModelStatistics.css"
import CytoscapeComponent from 'react-cytoscapejs';


function ModelStatistics({ node_cnt, edge_cnt, branch_cnt }) {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Model Statistics
      </Typography>
      <div className="card-container">
        <Card className="card" variant="outlined">
          <Typography variant="overline" gutterBottom className="card-hint">
            Total Nodes
          </Typography>
          <Typography variant="h4" gutterBottom className="card-cnt">
            {node_cnt}
          </Typography>
        </Card>
        <Card className="card" variant="outlined">
          <Typography variant="overline" gutterBottom className="card-hint">
            Total Connections
          </Typography>
          <Typography variant="h4" gutterBottom className="card-cnt">
            {edge_cnt}
          </Typography>
        </Card>
        <Card className="card" variant="outlined">
          <Typography variant="overline" gutterBottom className="card-hint">
            Total Branches
          </Typography>
          <Typography variant="h4" gutterBottom className="card-cnt">
            {branch_cnt}
          </Typography>
        </Card>
      </div>
    </>
  );
}

export default ModelStatistics