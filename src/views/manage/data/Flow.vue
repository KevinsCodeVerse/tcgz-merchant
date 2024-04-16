<template>
    <div id="data_flow">
        <div class="data animated fadeIn">
            <div>
                <div class="font_text">今日收入</div>
                <div class="theme">
                    +{{ countData.thisIncome != null ? $common.toThousands(countData.thisIncome, true) : '--' }}
                </div>
            </div>
            <div>
                <div class="font_text">今日支出</div>
                <div class="error">
                    -{{ countData.thisPay != null ? $common.toThousands(countData.thisPay, true) : '--' }}
                </div>
            </div>
            <div>
                <div class="font_text">近7天收入</div>
                <div class="theme">
                    +{{ countData.sevenIncome != null ? $common.toThousands(countData.sevenIncome, true) : '--' }}
                </div>
            </div>
            <div>
                <div>近7天支出</div>
                <div class="error">
                    -{{ countData.sevenPay != null ? $common.toThousands(countData.sevenPay, true) : '--' }}
                </div>
            </div>
        </div>

        <DateSelectView @changeDate="getDate" class="margin_top20 align-right"/>

        <div id="flow_data" style="width: 100%; height: 500px; margin-top: 20px;"></div>
    </div>
</template>

<script>
import DateSelectView from '@/components/DateSelectView'
import echarts from 'echarts'

export default {
    components: {
        DateSelectView
    },

    data() {
        return {
            countData: {
                thisIncome: null,
                thisPay: null,
                sevenIncome: null,
                sevenPay: null,
            },
            countAll: '',
            countCurrent: ''
        };
    },

    mounted() {
        this.getCount();
    },

    methods: {
        getCount() {
            this.$request.post({
                url: 'mt/flow/countData',
                success: result => {
                    this.countData.thisIncome = result.thisIncome || 0
                    this.countData.thisPay = result.thisPay || 0
                    this.countData.sevenIncome = result.sevenIncome || 0
                    this.countData.sevenPay = result.sevenPay || 0
                }
            })
        },

        getDate(result) {
            this.load = true
            this.$request.post({
                url: 'mt/flow/countByDate',
                params: {
                    type: result.type,
                    startTime: result.dates[0],
                    endTime: result.dates[1]
                },
                success: res => {
                    var payCount = this.screenData(result.type, result.dateStrs, res.payCount)
                    var incomeCount = this.screenData(result.type, result.dateStrs, res.incomeCount)
                    setTimeout(() => {
                        this.setEchart(result.dateStrs, incomeCount, payCount);
                    }, 0)
                },
                finally: () => {
                    this.load = false
                }
            })
        },

        // 筛选数据
        screenData(type, dateStrs, datas) {
            var result = [];
            for (var i = 0; i < dateStrs.length; i++) {
                var index = datas.findIndex(item => {
                    if (type == 'week') {
                        return item.date == i
                    } else if (type == "day") {
                        return item.date == dateStrs[i]
                    } else {
                        return item.date == i + 1
                    }
                })
                var item = datas[index];
                if (item && item.count) {
                    result.push(item.count)
                } else {
                    result.push(0)
                }
            }
            return result;
        },

        setEchart(dateStrs, incomeCount, payCount) {
            var chartOption = {
                title: {
                    text: "流水统计",
                    subtext: '单位 / 元',
                },
                tooltip: {
                    trigger: "axis"
                },
                legend: {
                    data: ['收入', '支出']
                },
                grid: {
                    left: '3%',
                    right: '3%',
                    top: '15%',
                    containLabel: true
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: {
                            show: true,
                            readOnly: false
                        },
                        magicType: {
                            show: true,
                            type: ["line", "bar"]
                        },
                        calculable: true,
                        restore: {
                            show: true
                        },
                        saveAsImage: {
                            show: true
                        }
                    },
                    x: document.body.clientWidth - 520 + 'px', //距离X轴多远
                },
                xAxis: [{
                    type: "category",
                    boundaryGap: false,
                    data: dateStrs
                }],
                yAxis: [{
                    type: "value"
                }],
                series: [{
                    name: "收入",
                    type: "line",
                    data: incomeCount,
                    smooth: true,
                    barGap: 0,
                    color: '#409EFF',
                    markPoint: {
                        data: [{
                            type: "max",
                            name: "最大值",
                        },
                            {
                                type: "min",
                                name: "最小值"
                            }
                        ]
                    },
                    markLine: {
                        data: [{
                            type: "average",
                            name: "平均值"
                        }]
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: "rgb(66, 158, 253, 0.4)"
                            },
                                {
                                    offset: 0.4,
                                    color: "rgb(66, 158, 253, 0.2)"
                                },
                                {
                                    offset: 1,
                                    color: "rgb(66, 158, 253, 0)"
                                }
                            ])
                        },
                    }, //填充区域样式
                    lineStyle: {
                        color: "#409EFF",
                        width: 1
                    }, //线条的样式
                },
                    {
                        name: "支出",
                        type: "line",
                        color: '#F56C6C',
                        barGap: 0.01,
                        data: payCount,
                        smooth: true,
                        markPoint: {
                            data: [{
                                type: "max",
                                name: "最大值"
                            },
                                {
                                    type: "min",
                                    name: "最小值"
                                }
                            ]
                        },
                        markLine: {
                            data: [{
                                type: "average",
                                name: "平均值"
                            }]
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: "rgb(244, 107, 107, 0.4)"
                                },
                                    {
                                        offset: 0.4,
                                        color: "rgb(244, 107, 107, 0.2)"
                                    },
                                    {
                                        offset: 1,
                                        color: "rgb(244, 107, 107, 0)"
                                    }
                                ])
                            },
                        }, //填充区域样式
                        lineStyle: {
                            color: "#F56C6C",
                            width: 1
                        }, //线条的样式
                    }
                ]
            };
            // 基于准备好的dom，初始化echarts实例
            let chart = echarts.init(document.getElementById("flow_data"));
            // console.log(chart, chartOption)
            // 绘制图表
            chart.setOption(chartOption);
            chart.setOption(chartOption);
        }
    }

}
</script>

<style>
#data_flow .animated {
    animation-duration: 0.5s !important;
}
</style>

<style scoped>
.data {
    display: flex;
    justify-content: space-around;
    background: #f5f5f5;
    padding: 20px 0;
    border-radius: 2px;
}

.data + .data {
    margin-top: 10px;
}

.data > div div {
    padding: 5px 0;
    text-align: center;
    font-size: 15px;
}

.data > div div:last-child {
    font-size: 22px;
    font-weight: 600;
}
</style>
