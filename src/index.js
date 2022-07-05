const dscc = require('@google/dscc');
const local = require('./localMessage.js');
const d3 = require('d3');
const Rainbow = require('rainbowvis.js');


// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = false;

const drawBar = (dataIn) => {
  // Definindo o estilo
  let style = {
    graph: {
      colorStart:
        dataIn.style.colorStart.value !== undefined
          ? dataIn.style.colorStart.value.color
          : dataIn.style.colorStart.defaultValue.color,
      colorEnd:
        dataIn.style.colorEnd.value !== undefined
          ? dataIn.style.colorEnd.value.color
          : dataIn.style.colorEnd.defaultValue.color,
      opacity:
        dataIn.style.opacity.value !== undefined
          ? dataIn.style.opacity.value
          : dataIn.style.opacity.defaultValue,
      barHeight:
        dataIn.style.barHeight.value !== undefined
          ? dataIn.style.barHeight.value
          : dataIn.style.barHeight.defaultValue,
      spacing:
        dataIn.style.spacing.value !== undefined
          ? dataIn.style.spacing.value
          : dataIn.style.spacing.defaultValue,
      barAlign:
        dataIn.style.barAlign.value !== undefined
          ? dataIn.style.barAlign.value
          : dataIn.style.barAlign.defaultValue,
      shapeType:
        dataIn.style.shapeType.value !== undefined
          ? dataIn.style.shapeType.value
          : dataIn.style.shapeType.defaultValue
    },
    margin: {
      top:
        dataIn.style.marginTop.value !== undefined
          ? dataIn.style.marginTop.value
          : dataIn.style.marginTop.defaultValue,
      bottom:
        dataIn.style.marginBottom.value !== undefined
          ? dataIn.style.marginBottom.value
          : dataIn.style.marginBottom.defaultValue,
      left:
        dataIn.style.marginLeft.value !== undefined
          ? dataIn.style.marginLeft.value
          : dataIn.style.marginLeft.defaultValue,
      right:
        dataIn.style.marginRight.value !== undefined
          ? dataIn.style.marginRight.value
          : dataIn.style.marginRight.defaultValue
    },
    label: {
      fontFamily:
        dataIn.style.labelFontFamily.value !== undefined
          ? dataIn.style.labelFontFamily.value
          : dataIn.style.labelFontFamily.defaultValue,
      fontSize:
        dataIn.style.labelFontSize.value !== undefined
          ? dataIn.style.labelFontSize.value
          : dataIn.style.labelFontSize.defaultValue,
      fontColor:
        dataIn.style.labelFontColor.value !== undefined
          ? dataIn.style.labelFontColor.value.color
          : dataIn.style.labelFontColor.defaultValue.color,
      verticalAlign:
        dataIn.style.textVerticalAlignLabel.value !== undefined
          ? dataIn.style.textVerticalAlignLabel.value
          : dataIn.style.textVerticalAlignLabel.defaultValue,
      horizontalAlign:
        dataIn.style.textHorizontalAlignLabel.value !== undefined
          ? dataIn.style.textHorizontalAlignLabel.value
          : dataIn.style.textHorizontalAlignLabel.defaultValue,
      position:
        dataIn.style.positionLabel.value !== undefined
          ? dataIn.style.positionLabel.value
          : dataIn.style.positionLabel.defaultValue,
      show:
        dataIn.style.showLabel.value !== undefined
          ? dataIn.style.showLabel.value
          : dataIn.style.showLabel.defaultValue
    },
    value: {
      fontFamily:
        dataIn.style.valueFontFamily.value !== undefined
          ? dataIn.style.valueFontFamily.value
          : dataIn.style.valueFontFamily.defaultValue,
      fontSize:
        dataIn.style.valueFontSize.value !== undefined
          ? dataIn.style.valueFontSize.value
          : dataIn.style.valueFontSize.defaultValue,
      fontColor:
        dataIn.style.valueFontColor.value !== undefined
          ? dataIn.style.valueFontColor.value.color
          : dataIn.style.valueFontColor.defaultValue.color,
      verticalAlign:
        dataIn.style.textVerticalAlignValue.value !== undefined
          ? dataIn.style.textVerticalAlignValue.value
          : dataIn.style.textVerticalAlignValue.defaultValue,
      horizontalAlign:
        dataIn.style.textHorizontalAlignValue.value !== undefined
          ? dataIn.style.textHorizontalAlignValue.value
          : dataIn.style.textHorizontalAlignValue.defaultValue,
      position:
        dataIn.style.positionValue.value !== undefined
          ? dataIn.style.positionValue.value
          : dataIn.style.positionValue.defaultValue,
      show:
        dataIn.style.showValue.value !== undefined
          ? dataIn.style.showValue.value
          : dataIn.style.showValue.defaultValue
    },
    conversion: {
      fontFamily:
        dataIn.style.conversionFontFamily.value !== undefined
          ? dataIn.style.conversionFontFamily.value
          : dataIn.style.conversionFontFamily.defaultValue,
      fontSize:
        dataIn.style.conversionFontSize.value !== undefined
          ? dataIn.style.conversionFontSize.value
          : dataIn.style.conversionFontSize.defaultValue,
      fontColor:
        dataIn.style.conversionFontColor.value !== undefined
          ? dataIn.style.conversionFontColor.value.color
          : dataIn.style.conversionFontColor.defaultValue.color,
      verticalAlign:
        'bottom',
      horizontalAlign:
        dataIn.style.textHorizontalAlignConversion.value !== undefined
          ? dataIn.style.textHorizontalAlignConversion.value
          : dataIn.style.textHorizontalAlignConversion.defaultValue,
      position:
        'out',
      show:
        dataIn.style.showConversion.value !== undefined
          ? dataIn.style.showConversion.value
          : dataIn.style.showConversion.defaultValue
    }
  }

  // cálculo dos totais por métricas
  var total = [];
  for (var i = 0; i < dataIn.fields.metricID.length; i++) {
    var t = 0;
    dataIn.tables.DEFAULT.forEach(element => {
      t += element.metricID[i];
    });
    total.push(t);
  }

  // array de dados com nome da métrica, valor total, valor formatado e taxa de conversão para métrica anterior
  var data = [];
  for (var i = 0; i < dataIn.fields.metricID.length; i++) {
    var conversion = Math.round((total[i + 1] / total[i] + Number.EPSILON) * 1000) / 10;
    data.push({
      name: dataIn.fields.metricID[i].name,
      value: total[i],
      format: total[i].toLocaleString(),
      conversion: conversion
    });
  }

  // Cria a paleta de cores em gradiente para o gráfico
  var rainbow = new Rainbow();
  rainbow.setNumberRange(1, dataIn.fields.metricID.length);
  rainbow.setSpectrum(style.graph.colorStart, style.graph.colorEnd);
  var colors = [];
  for (var i = 1; i <= dataIn.fields.metricID.length; i++) {
    var hexColour = rainbow.colourAt(i);
    colors.push('#' + hexColour);
  }

  var margin = { top: style.margin.top, right: style.margin.right, bottom: style.margin.bottom, left: style.margin.left },
    width, height;
  if (style.graph.shapeType === 'bars') {
    width = window.innerWidth - margin.left - margin.right;
    height = Math.ceil((data.length + 0.1) * style.graph.barHeight) + margin.top + margin.bottom;
  }
  else {
    height = window.innerHeight - margin.top - margin.bottom;
    width = Math.ceil((data.length + 0.1) * style.graph.barHeight) + margin.left + margin.right;
  }

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  d3.select('body')
    .selectAll('svg')
    .remove();

  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  if (style.graph.shapeType === 'bars') {
    var y = d3.scaleBand()
      .domain(d3.range(data.length))
      .rangeRound([margin.top, height - margin.bottom])
      .padding(parseFloat(style.graph.spacing));

    var x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([margin.left, margin.left + width]);

    svg.append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("fill", (d, i) => colors[i])
      .attr("fill-opacity", style.graph.opacity)
      .attr("x", d => {
        if (style.graph.barAlign === 'left') {
          return x(0);
        }
        else if (style.graph.barAlign === 'center') {
          return (width - x(d.value) + x(0)) / 2;
        }
        else { // right
          return x(d3.max(data, d => d.value)) - x(d.value) + x(0);
        }
      })
      .attr("y", (d, i) => y(i))
      .attr("width", d => x(d.value) - x(0))
      .attr("height", y.bandwidth());

    // label
    if (style.label.show) {
      appendTextBars(svg, width, x, y, style.graph.barAlign, style.label, data, '{l}')
    }

    // value
    if (style.value.show) {
      appendTextBars(svg, width, x, y, style.graph.barAlign, style.value, data, '{f}')
    }

    // conversion
    if (style.conversion.show) {
      var dx = style.conversion.fontSize / 2;
      if (style.conversion.horizontalAlign === 'start') {
        dx += -style.margin.left;
      }
      else if (style.conversion.horizontalAlign === 'end') {
        dx += style.margin.left * 2;
      }
      appendTextBars(svg, width, x, y, style.graph.barAlign, style.conversion, data, '{c}', dx,
        style.graph.barHeight * style.graph.spacing);
    }
  }
  else { // columns
    var x = d3.scaleBand()
      .domain(d3.range(data.length))
      .range([margin.left, width - margin.right])
      .padding(parseFloat(style.graph.spacing));

    var y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .rangeRound([margin.top, height - margin.bottom]);

    svg.append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("fill", (d, i) => colors[i])
      .attr("fill-opacity", style.graph.opacity)
      .attr("y", d => {
        if (style.graph.barAlign === 'left') {
          return y(0);
        }
        else if (style.graph.barAlign === 'center') {
          return (height - y(d.value) + y(0)) / 2;
        }
        else { // right
          return y(d3.max(data, d => d.value)) - y(d.value) + y(0);
        }
      })
      .attr("x", (d, i) => x(i))
      .attr("height", d => y(d.value) - y(0))
      .attr("width", x.bandwidth());

    // label
    if (style.label.show) {
      appendTextColumns(svg, width, x, y, style.graph.barAlign, style.label, data, '{l}')
    }

    // value
    if (style.value.show) {
      appendTextColumns(svg, width, x, y, style.graph.barAlign, style.value, data, '{f}')
    }

    // conversion
    if (style.conversion.show) {
      appendTextColumns(svg, width, x, y, style.graph.barAlign, style.conversion, data, '{c}', (margin.left + margin.right) / 10);
    }
  }
  return svg.node();
}



function appendTextColumns(svg, width, x, y, barAlign, label, data, text) {
  svg.append("g")
    .attr("fill", label.fontColor)
    .attr("text-anchor", d => {
      if (label.position === 'out' || label.horizontalAlign === 'middle') return label.horizontalAlign;
      else if (label.horizontalAlign === 'start') return 'end';
      else if (label.horizontalAlign === 'end') return 'start';
    })
    .attr("font-family", label.fontFamily)
    .attr("font-size", label.fontSize)
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("y", d => {
      if (label.horizontalAlign === 'middle') {
        return width / 2; //center
      }

      if (text === '{c}') {
        if (label.horizontalAlign === 'end')
          return y(0);
        else if (label.horizontalAlign === 'start')
          return y(d3.max(data, d => d.value));
      }

      if (barAlign === 'left') {
        if (label.horizontalAlign === 'start') return y(d.value); //right
        else return y(0); //left
      }
      else if (barAlign === 'center') {
        if (label.horizontalAlign === 'start') return (height + y(d.value) - y(0)) / 2; //right
        else return (height - y(d.value) + y(0)) / 2; //left
      }
      else { // right
        if (label.horizontalAlign === 'start') return y(d3.max(data, d => d.value)); //right
        else return y(d3.max(data, d => d.value)) - y(d.value) + y(0); //left
      }


    })
    .attr("x", (d, i) => {
      if (label.verticalAlign === 'top' && label.horizontalAlign === 'middle' && label.position === 'out') return x(i);
      else if (label.verticalAlign === 'top') return x(i) + label.fontSize / 2;
      else if (label.verticalAlign === 'bottom') return x(i) + x.bandwidth() - label.fontSize / 2;
      else return x(i) + x.bandwidth() / 2; // middle 
    })
    .attr("dy", 0)
    .attr("dx", 0)
    .text((d, i) => {
      if (text === '{l}') return d.name;
      else if (text === '{f}') return d.format;
      else if (text === '{v}') return d.value;
      else if (text === '{c}' && !isNaN(d.conversion)) return d.conversion.toLocaleString() + '%';
    })
    .attr("transform", (d, i) => {
      if (text !== '{c}') return "translate(" + x(0) + "," + y(0) + ")rotate(-60)";
      else return "rotate(0)"
    });
}

function appendTextBars(svg, width, x, y, barAlign, label, data, text, dx = label.fontSize / 2, dy = "0.35em") {
  if (label.horizontalAlign === 'end') {
    dx = -dx;
  }
  else if (label.horizontalAlign === 'middle') {
    dx = 0;
  }
  /* if(label.verticalAlign === 'top' && text === '{c}'){
    dy = -dy + 8;
  }
  else if(label.verticalAlign === 'middle' && text === '{c}'){
    dy = 5;
  }
  else */
  if (text === '{c}') {
    dy = dy / 2 + label.fontSize;
  }
  svg.append("g")
    .attr("fill", label.fontColor)
    .attr("text-anchor", d => {
      if (label.position === 'out' || label.horizontalAlign === 'middle') return label.horizontalAlign;
      else if (label.horizontalAlign === 'start') return 'end';
      else if (label.horizontalAlign === 'end') return 'start';
    })
    .attr("font-family", label.fontFamily)
    .attr("font-size", label.fontSize)
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("x", d => {
      if (label.horizontalAlign === 'middle') {
        return width / 2; //center
      }

      if (text === '{c}') {
        if (label.horizontalAlign === 'end')
          return x(0);
        else if (label.horizontalAlign === 'start')
          return x(d3.max(data, d => d.value));
      }

      if (barAlign === 'left') {
        if (label.horizontalAlign === 'start') return x(d.value); //right
        else return x(0); //left
      }
      else if (barAlign === 'center') {
        if (label.horizontalAlign === 'start') return (width + x(d.value) - x(0)) / 2; //right
        else if (label.position === 'out') return (width - x(d.value) + x(0)) / 2; //left and out
        else return (width - x(d.value) + x(0)) / 2 - 2*dx; //left and in
      }
      else { // right
        if (label.horizontalAlign === 'start') return x(d3.max(data, d => d.value)); //right
        else return x(d3.max(data, d => d.value)) - x(d.value) + x(0); //left
      }


    })
    .attr("y", (d, i) => {
      if (label.verticalAlign === 'top' && label.horizontalAlign === 'middle' && label.position === 'out') return y(i);
      else if (label.verticalAlign === 'top') return y(i) + label.fontSize / 2;
      else if (label.verticalAlign === 'bottom') return y(i) + y.bandwidth() - label.fontSize / 2;
      else return y(i) + y.bandwidth() / 2; // middle 
    })
    .attr("dy", dy)
    .attr("dx", dx)
    .text((d, i) => {
      if (text === '{l}') return d.name;
      else if (text === '{f}') return d.format;
      else if (text === '{v}') return d.value;
      else if (text === '{c}' && !isNaN(d.conversion)) return d.conversion.toLocaleString() + '%';
    });
  /*.call(text => text.filter(d => x(d.value) - x(0) < 20 && barAlign === 'left') // short bars
    .attr("dx", +4)
    .attr("text-anchor", "start"));*/
}

// renders locally
if (LOCAL) {
  drawBar(local.message);
} else {
  dscc.subscribeToData(drawBar, { transform: dscc.objectTransform });
}

