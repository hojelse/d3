import React, { useEffect } from "react";
import './App.css';
import * as d3 from 'd3';
import data from "./graph.json";
import { cleanup } from "@testing-library/react";

function App() {

  return (
    <div
      className="App"
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Chart></Chart>
    </div>
  );
}


function Chart() {

  const ref = React.useRef<HTMLDivElement>(null);

  const height = 680;
  const width = 680;

  let color = (d: any) => {
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    return scale(d.group);
  }

  let drag = (simulation: any) => {

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  useEffect(() => {
    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    const simulation = d3.forceSimulation(nodes)
      // @ts-ignore
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    const svg = d3.create("svg")
      .attr("viewBox", `${-width / 2}, ${-height / 2}, ${width}, ${height}`)
      .attr("height", height)
      .attr("width", width)

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 5)
      .attr("fill", color)
      // @ts-ignore
      .call(drag(simulation));

    node.append("title")
      .text(d => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    });

    let container = ref.current
    container.appendChild(svg.node());
    
    // Cleanup
    return () => {
      let container = ref.current;
      container.removeChild(svg.node());
    }
  }, []);

  return (
    <div
      ref={ref}
    ></div>
  );
}

export default App;
