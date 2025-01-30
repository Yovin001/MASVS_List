import * as echarts from 'echarts';


    // Esperar a que el DOM esté listo
    document.addEventListener('DOMContentLoaded', () => {
      const chartDom = document.getElementById('chart');
      if (chartDom) {
        const myChart = echarts.init(chartDom);

        const option = {
          color: ['#67F9D8', '#FFE434', '#56A3F1', '#FF917C'],
          title: {
            text: 'Customized Radar Chart'
          },
          legend: {},
          radar: [
            {
              indicator: [
                { text: 'Indicator1', max: 150 },
                { text: 'Indicator2', max: 150 },
                { text: 'Indicator3', max: 150 },
                { text: 'Indicator4', max: 120 },
                { text: 'Indicator5', max: 108 },
                { text: 'Indicator6', max: 72 }
              ],
              center: ['75%', '50%'],
              radius: 120,
              axisName: {
                color: '#fff',
                backgroundColor: '#666',
                borderRadius: 3,
                padding: [3, 5]
              }
            }
          ],
          series: [
            {
              type: 'radar',
              radarIndex: 1,
              data: [
                {
                  value: [120, 118, 130, 100, 99, 70],
                  name: 'Data C',
                  symbol: 'rect',
                  symbolSize: 12,
                  lineStyle: {
                    type: 'dashed'
                  },
                  label: {
                    show: true,
                    formatter: function (params) {
                      return params.value;
                    }
                  }
                },
                {
                  value: [100, 93, 50, 90, 70, 60],
                  name: 'Data D',
                  areaStyle: {
                    color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                      {
                        color: 'rgba(255, 145, 124, 0.1)',
                        offset: 0
                      },
                      {
                        color: 'rgba(255, 145, 124, 0.9)',
                        offset: 1
                      }
                    ])
                  }
                }
              ]
            }
          ]
        };

        myChart.setOption(option);
      }
    });
