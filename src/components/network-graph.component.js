import { CloseOutlined } from "@mui/icons-material";
import { Autocomplete, Box, Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, TextField } from "@mui/material";
import React, { Component } from "react";
import Graph from "react-graph-vis";
import { hoc } from "../common/hoc.compnonent";
import data from '../data.json'

const options = {
  layout: {
    hierarchical: false
  },
  edges: {
    color: "#000000"
  },
  height: "500px"
};

export class NetworkGraph extends Component {

    constructor(props) {
        super(props)
        this.state = {
          nodes: data.nodes,
          edges: data.edges,
          initData: data,
          selectedValue: {nodes: [], edges: []},
          isOpen: false
        }
        this.setNodes = this.setNodes.bind(this)
        this.setEdges = this.setEdges.bind(this)
        this.autoCompleteChange = this.autoCompleteChange.bind(this)
    }

    /**
     * The following two methods bind the getNode function & getEdge function
     * These functions are created in a library which help add or clear the nodes for graph
     */
    setNodes(nodes) {
      this.setState({
        nodes: nodes
      })
    }
    setEdges(edges) {
      this.setState({
        edges: edges
      })
    }

    /**
     * The function which executes when the node is selected from dropdown. 
     */
    autoCompleteChange(value) {
      this.state.nodes.clear()
      this.state.edges.clear()
      let filterNodes = data.nodes, filterEdges = data.edges
      const {nodes, edges} = data
      if (value?.id) {
        this.state.nodes.add(value)
        this.setState({
          initData: {nodes: [value], edges: []}
        })
        filterNodes = [value]
        filterEdges = edges.filter((item) => item.from === value.id || item.to === value.id)
      }
      filterEdges = filterEdges.map((edge) => {
        this.state.edges.add(edge)
        let queryNode
        if (filterNodes.findIndex((item) => item.id === edge.from) === -1) {
          queryNode = nodes.filter((item) => item.id === edge.from)[0]
        }
        if (filterNodes.findIndex((item) => item.id === edge.to) === -1) {
          queryNode = nodes.filter((item) => item.id === edge.to)[0]
        }
        this.state.nodes.add(queryNode)
        this.setState((prevState) => ({initData: { nodes: [...prevState.initData.nodes, queryNode], edges:[...prevState.initData.edges, edge]}}))
        filterNodes.concat([queryNode])
        return edge
      })
      setTimeout(() => {
        console.log(this.state);
      }, 500);
    }

    getNodeFromId(id) {
      let nodes = data.nodes
      const foundNode = nodes.filter((item) => item.id === id)
      return foundNode?.[0]
    }
    render() {
        const events = {
          select: (event) => {
            const {nodes, edges} = event
            this.setState({selectedValue: {nodes, edges}, isOpen: true})
          }
        };
        return (
            <Box sx={{display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '5px'}}>
              <Autocomplete
                disablePortal
                disableClearable
                id="combo-box-demo"
                options={data.nodes}
                sx={{ width: 300, mt: '5px' }}
                onChange={(event, newValue) => this.autoCompleteChange(newValue)}
                renderInput={(params) => <TextField {...params} label="Nodes" />}
              />
              <Graph graph={{nodes: [], edges: []}} options={options} events={events}
                getEdges={this.setEdges} getNodes={this.setNodes} />

              {this.state.nodes && 
              <Dialog open={this.state.isOpen} onClose={() => this.setState({isOpen: false})}
                aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                  <DialogTitle id="alert-dialog-title">
                    {this.getNodeFromId(this.state.selectedValue.nodes)?.label}
                    <IconButton onClick={() => this.setState({isOpen: false})} sx={{position: 'absolute', right: 0, pt: 0}}>
                      <CloseOutlined />
                    </IconButton>
                  </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    No. of Edges: {this.state.selectedValue.edges.length}
                  </DialogContentText>
                </DialogContent>
              </Dialog>}
            </Box>
        )
    }
}

export default hoc(NetworkGraph)