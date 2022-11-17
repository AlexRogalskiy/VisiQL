import React, { useRef, useEffect, useState } from 'react';
import {
  select,
  create,
  event,
  line,
  selectAll,
  curveCardinal,
  hierarchy,
  tree,
  linkHorizontal,
  link, zoom, 
  
} from 'd3';
const d3 = require('d3');

const Tree = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = select(svgRef.current);
    const clearAllNodes = svg.selectAll('g').remove();
    const root = hierarchy(data);
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
      if (d.depth === 3) {
        d.children = d.children ? null : d._children;
      };
    });

    // zoom functionality

    const svgG = svg.append('g')
    .attr('class', 'zoomGroup');
    // svgG.append('circle')
    // .attr('r', 10);

    // let zoom = d3.zoom()
    // .on('zoom', handleZoom);

 const handleZoom = e => {
  console.log('in handlezoom');
  //  node
   svg.selectAll('g')
   .attr('transform', d3.zoomTransform(this));
 }

 const initZoom = () => {
  console.log('in initZoom');
  //  d3.select('svg').call(zoom);
   svg.selectAll('g').call(d3.zoom(d3.zoom()
   .on('zoom', handleZoom())));
 }


    const gLink = svg.append('g').attr('fill', 'none');

    const gNode = svg
      .append('g')
      .attr('cursor', 'pointer')
      .attr('pointer-events', 'all');

    const update = (source) => {

      // const initZoom = () => {
      //   console.log('in initZoom');
      //   //  d3.select('svg').call(zoom);
      //    svg.selectAll('g').call(zoom(d3.zoom()
      //    .on('zoom', handleZoom())));
      //  }


      const duration = 500;
      const nodes = root.descendants().reverse();
      const links = root.links();

      const treeLayout = tree().size([
        document.getElementById('diagram').clientHeight,
        document.getElementById('diagram').clientWidth,
      ]);
      treeLayout(root);

      //make size of diagram div responsive
      const diagramDiv = document.getElementById('diagram');
      svg.attr('viewBox', [
        document.getElementById('diagram').clientWidth * -0.11,
        document.getElementById('diagram').clientHeight * 0.3,
        document.getElementById('diagram').clientWidth * 1.3,
        document.getElementById('diagram').clientHeight / 2,
      ]);

      const linkGenerator = linkHorizontal()
        .x((node) => node.y)
        .y((node) => node.x);

      const transition = svg.transition().duration(duration);

      const node = gNode.selectAll('g').data(nodes, (d) => d.id);

      const nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', (d) => `translate(${source.y0},${source.x0})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0);

      nodeEnter
        .append('circle')
        .attr('r', 3)
        .attr('fill', (d) => (d._children ? '#ed6a5a' : '#5ca4a9'))
        .attr('stroke-width', 10)
        .on('click', (event, d) => {
          d.children = d.children ? null : d._children;
          update(d);
        });

      nodeEnter
        .append('text')
        .attr('class', 'label')
        .attr('dy', '0.31em')
        .attr('x', (d) => (d._children ? -6 : 6))
        .attr('text-anchor', (d) => (d._children ? 'end' : 'beginning'))
        .attr('fill', d => {
          if (d.data.name.slice(0, 7) === 'primKey') return 'red';
          return 'black';
        })
        .text((d) => {
          if (d.data.name.slice(0, 7) === 'primKey') {
            return d.data.name.slice(7);
          }
          return d.data.name;
        })
        .on('click', (event, node) => {
          if (node.children) return;
          if (node.data.name[node.data.name.length - 1] === '!') {
            node.data.name = node.data.name.slice(0, -1);
          } else node.data.name += '!';
          console.log('node.data.name: ', node.data.name);
          svg.selectAll('.label').text((d) => d.data.name);
        })
        .attr('font-size', 25)
        .clone(true)
        .lower()
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 3)
        .attr('stroke-opacity', 0);

      const nodeUpdate = node
        .merge(nodeEnter)
        .transition(transition)
        .attr('transform', (d) => `translate(${d.y},${d.x})`)
        .attr('fill-opacity', 1)
        .attr('stroke-opacity', 1);

      const nodeExit = node
        .exit()
        .transition(transition)
        .remove()
        .attr('transform', (d) => `translate(${source.y},${source.x})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0);

      const link = gLink.selectAll('path').data(links, (d) => d.target.id);

      const linkEnter = link
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('stroke', '#5ca4a9')
        .attr('d', (d) => {
          const o = { x: source.x0, y: source.y0 };
          return linkGenerator({ source: o, target: o });
        });

      link
        .merge(linkEnter)
        .transition(transition)
        .attr('d', linkGenerator)
        .transition()
        .attr('stroke-dashoffset', 0);

      link
        .exit()
        .transition(transition)
        .remove()
        .attr('d', (d) => {
          const o = { x: source.x, y: source.y };
          return linkGenerator({ source: o, target: o });
        });

      root.eachBefore((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      // const handleZoom = ({ transform }) => {
      //   console.log('in handlezoom');
      //    gNode.selectAll('g')
      //    .attr('transform', transform);
      //  }
      //  initZoom();
    };
    // const handleZoom = ({ transform }) => {
    //   console.log('in handlezoom');
    //    gNode.selectAll('g')
    //    .attr('transform', transform);
    //  }

    
    initZoom();
    update(root);
  }, [data]);

  return (
    <div id='diagram'>
      <svg id='tree-svg' ref={svgRef}></svg>
    </div>
  );
};

export default Tree;
