document.addEventListener('DOMContentLoaded', () => {
  const URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';
  const width = 1500;
  const height = 800;
  const margin = { top: 20, right: 20, bottom: 100, left: 100}
  const innerWidth = width - margin.right - margin.left;
  const innerHeight = height - margin.top - margin.bottom;
  const yTitle = "Gross Domestic Product";
  const chartTitle = "United States GDP";
  const source = "More Information: http://www.bea.gov/national/pdf/nipaguid.pdf";
  
  //get data      
  d3.queue()
    .defer(d3.json, URL)
    .await((error, responseData) => {
      //set up data
      let data = responseData.data.map((quarterData, index) => {
        let quarter = quarterData[0];
        let gdp = quarterData[1];

        return { quarter, gdp };
      });

      //set up svg
      const svg = d3.select("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .classed("svg", true)
      
      //add data source text
      svg
        .append("text")
        .attr("x", innerWidth/2 + 250)
        .attr("y", innerHeight + 85)
        .text(source)
        .style("font-style", "italic")        

      
      //add chart title
      d3.select("#title")          
          .classed("title", true)
          .text(chartTitle)

      //create scales
      let xScale = d3.scaleTime()
                      .domain([new Date(data[0].quarter), new Date(data[data.length-1].quarter)])
                      .range([margin.left, innerWidth])
      
      let yScale = d3.scaleLinear()
                       .domain([0, d3.max(data, d => d.gdp)])
                       .range([innerHeight, 0])
      
      // set up axis
      svg.append('g')
         .attr("id", "x-axis")
         .call(d3.axisBottom(xScale))
           .attr("transform", `translate(0,${innerHeight})`)
         .selectAll('text')

      svg.append('g')
         .attr("id", "y-axis")
         .call(d3.axisLeft(yScale))
           .attr("transform", `translate(${margin.left},0)`)

      // y axis label
      svg.append("text")
         .attr("text-anchor", "end")
         .attr("transform", "rotate(-90)")
         .attr("y", margin.left+20)
         .attr("x", margin.top - 60)
         .classed("x-label", true)
         .text(yTitle)
      
      //tooltip
      var tooltip = d3.select("body")                    
                      .append("div")
                        .attr("id", "tooltip")                        
                        .classed("tooltip", true);

      svg.selectAll('.bar')
         .data(data)
         .enter()
         .append('rect')
           .classed("bar", true)
           .attr("data-date", d => d.quarter)
           .attr("data-gdp", d => d.gdp)
           .attr('x', d => xScale(new Date(d.quarter)))
           .attr('y', d => yScale(d.gdp))
           .attr('width', xScale.length*3)
           .attr('height', d => innerHeight - yScale(d.gdp))
           .attr("fill", "steelblue")
           .style("margin", "1px")
           .on("mouseover", showTooltip)
           .on("touchstart", showTooltip)
           .on("mouseout", hideTooltip)    
           .on("touchend", hideTooltip);

      function showTooltip(d) {
        let formatDecimal = (d) => ( `$${d3.format(",.1f")(d)} Billion`);
        let year = d.quarter.split('-')[0];
        let q = `Q${parseInt(d.quarter.split('-')[1])%4 + 1}`;
        let quarter = `${year} ${q}`;
        let gdp = formatDecimal(d.gdp);
        
        tooltip
          .attr("data-date", d.quarter)
          .style("opacity", 1)
          .style("left", `${d3.event.x - tooltip.node().offsetWidth/2}px`)
          .style("top", `${d3.event.y + 25}px`)
          .html(`
            <p>${quarter}</p>
            <p>${gdp}</p>
          `);          
      }

      function hideTooltip() {
        tooltip
          .style("opacity", 0);
      }                      
    });
});