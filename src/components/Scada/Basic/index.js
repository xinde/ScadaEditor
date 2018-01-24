export default {
  tools: [
    {
      id: 0,
      name: 'scada-label',
      defaultSize: {
        width: 60,
        height: 20,
        keepRatio: false
      },
      imgUrl: '',
      attrs: [{ name: 'val1', label: 'Text', type: 'String', value: 'label' }],
      params: []
    },
    {
      id: 1,
      name: 'scada-guage',
      defaultSize: {
        width: 100,
        height: 75,
        keepRatio: true
      },
      imgUrl: '',
      attrs: [{ name: 'val1', label: '指示值', type: 'Number', value: 42 }],
      params: [{ name: 'minVal', label: '最小值', type: 'Number', value: '0' },
        { name: 'maxVal', label: '最大值', type: 'Number', value: '100' }]
    },
    {
      id: 2,
      name: 'scada-levelbar',
      defaultSize: {
        width: 60,
        height: 100,
        keepRatio: false
      },
      imgUrl: '',
      attrs: [{ name: 'val1', label: '显示值', type: 'Number', value: 33 }],
      params: [{ name: 'fill', label: '填充色', type: 'Color', value: '#43b5ff' },
        { name: 'background', label: '背景色', type: 'Color', value: '#CCC' }]
    }
  ]
}
