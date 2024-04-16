<template>
    <div id="data_profit">
        <div class="data animated fadeIn">
            <div>
                <div class="font_text">今日收益</div>
                <div class="theme">
                    ￥{{ countData.thisSum != null ? $common.toThousands(countData.thisSum, true) : '--' }}
                </div>
            </div>
            <div>
                <div class="font_text">昨日收益</div>
                <div class="theme">
                    ￥{{ countData.lastSum != null ? $common.toThousands(countData.lastSum, true) : '--' }}
                </div>
            </div>
            <div>
                <div class="font_text">近7天收益</div>
                <div class="theme">
                    ￥{{ countData.sevenSum != null ? $common.toThousands(countData.sevenSum, true) : '--' }}
                </div>
            </div>
            <div>
                <div class="font_text">近30天收益</div>
                <div class="theme">
                    ￥{{ countData.thirtySum != null ? $common.toThousands(countData.thirtySum, true) : '--' }}
                </div>
            </div>
        </div>

        <DateSelectView @changeDate="getDate" class="margin_top20 align-right"/>

        <div id="profit_data" style="width: 100%; height: 500px; margin-top: 20px;"></div>
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
                thisSum: null,
                lastSum: null,
                sevenSum: null,
                thirtySum: null
            }
        };
    },

    mounted() {
        this.getCountData()
    },

    methods: {
        getCountData() {
            this.$request.post({
                url: 'mt/flow/incomeCountData',
                success: result => {
                    this.countData.thisSum = result.thisSum || 0
                    this.countData.lastSum = result.lastSum || 0
                    this.countData.sevenSum = result.sevenSum || 0
                    this.countData.thirtySum = result.thirtySum || 0
                }
            })
        },

        getDate(result) {
            this.load = true
            this.$request.post({
                url: 'mt/flow/incomeCountByDate',
                params: {
                    type: result.type,
                    startTime: result.dates[0],
                    endTime: result.dates[1]
                },
                success: res => {
                    var list = this.screenData(result.type, result.dateStrs, res)
                    this.setEchart(result.dateStrs, list);
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

        setEchart(dateStrs, list) {
            var chartOption = {
                title: {
                    text: "收益统计",
                    subtext: '单位 / 元',
                },
                tooltip: {
                    trigger: "axis"
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
                    data: list,
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
                }]
            };
            // 基于准备好的dom，初始化echarts实例
            let chart = echarts.init(document.getElementById("profit_data"));
            // 绘制图表
            chart.setOption(chartOption);
        }
    }

}
</script>

<style>
#data_profit .animated {
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
