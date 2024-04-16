<template>
    <div id="data_profit">
        <div class="data animated fadeIn">
            <div>
                <div class="font_text">今日营业额</div>
                <div class="theme">
                    ￥{{ countData.thisSum != null ? $common.toThousands(countData.thisSum, true) : '--' }}
                </div>
            </div>
            <div>
                <div class="font_text">昨日营业额</div>
                <div class="theme">
                    ￥{{ countData.lastSum != null ? $common.toThousands(countData.lastSum, true) : '--' }}
                </div>
            </div>
            <div>
                <div class="font_text">近7天营业额</div>
                <div class="theme">
                    ￥{{ countData.sevenSum != null ? $common.toThousands(countData.sevenSum, true) : '--' }}
                </div>
            </div>
            <div>
                <div class="font_text">近30天营业额</div>
                <div class="theme">
                    ￥{{ countData.thirtySum != null ? $common.toThousands(countData.thirtySum, true) : '--' }}
                </div>
            </div>
            <div>
                <div class="font_text">累积营业额</div>
                <div class="theme">
                    ￥{{ countData.sum != null ? $common.toThousands(countData.sum, true) : '--' }}
                </div>
            </div>
        </div>
        <!-- <div style="margin-top: 18px;">
            <el-radio-group v-model="active" @change="select" size="mini">
                <el-radio-button :label="item.id" v-for="item in option" :key="item.id">{{ item.label }}</el-radio-button>
            </el-radio-group>
        </div> -->
        <div class="from_menu">
            <el-radio-group v-model="active" @change="select" size="mini">
                <el-radio-button :label="item.id" v-for="item in optionOrder" :key="item.id">{{ item.label }}</el-radio-button>
            </el-radio-group>
            <DateSelectView @changeDate="getDate" class="" ref="dateSelect">
                <el-button size="mini" slot="extend" @click="select()" icon="el-icon-refresh">刷新</el-button>
            </DateSelectView>
        </div>

        <div id="profit_data" style="width: 100%; height: 500px; margin-top: 20px"></div>
    </div>
</template>

<script>
import DateSelectView from '@/components/DateSelectView.vue';
import echarts from 'echarts';

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
                thirtySum: null,
                sum: null
            },
            loading: this.$loading({
                lock: true,
                text: 'Loading',
                spinner: 'el-icon-loading',
                background: 'rgba(255, 255, 255, 0.7)'
            }),
            // option: [
            //     { label: '累计应用', id: 0 },
            //     // { label: '拼团应用', id: 1 },
            //     // { label: '秒杀应用', id: 2 },
            //     // { label: '优惠券应用', id: 3 },
            //     { label: '分销应用', id: 4 },
            //     { label: '同城优选', id: 6 },
            //     // { label: '市级应用', id: 7 },
            //     // { label: '集体应用', id: 8 },
            //     { label: '广告竞价', id: 9 }
            // ],
            
            optionOrder: [
                { label: '累计商城', id: 20 },
                { label: '普通订单', id: 21 },
                { label: '秒杀订单', id: 22 },
                { label: '团购订单', id: 23 }
            ],
            active: 20, //
            countType: 1 //1营业额 2订单数量
        };
    },
    mounted() {
        this.getCountData();
    },

    methods: {
        // 选择的
        select(e) {
            console.log(e);
            this.getCountData();
            let ref = this.$refs.dateSelect;
            if (ref.dateRange && ref.dateRange.length > 0) {
                this.$refs.dateSelect.dateRangeChange(ref.dateRange);
            } else {
                this.$refs.dateSelect.getDate();
            }
        },
        getCountData() {
            this.$request.post({
                url: 'mt/flow/appCountData',
                params: {
                    status: this.active,
                    countType: this.countType
                },
                success: (result) => {
                    this.loading.close();
                    this.countData.thisSum = result.thisSum || 0;
                    this.countData.lastSum = result.lastSum || 0;
                    this.countData.sevenSum = result.sevenSum || 0;
                    this.countData.thirtySum = result.thirtySum || 0;
                    this.countData.sum = result.sum || 0;
                }
            });
        },

        getDate(result) {
            this.load = true;
            this.$request.post({
                url: 'mt/flow/appCountByDate',
                params: {
                    type: result.type,
                    startTime: result.dates[0],
                    endTime: result.dates[1],
                    status: this.active,
                    countType: this.countType
                },
                success: (res) => {
                    var list = this.screenData(result.type, result.dateStrs, res);
                    this.setEchart(result.dateStrs, list);
                },
                finally: () => {
                    this.load = false;
                }
            });
        },

        // 筛选数据
        screenData(type, dateStrs, datas) {
            var result = [];
            for (var i = 0; i < dateStrs.length; i++) {
                var index = datas.findIndex((item) => {
                    if (type == 'week') {
                        return item.date == i;
                    } else if (type == 'day') {
                        return item.date == dateStrs[i];
                    } else {
                        return item.date == i + 1;
                    }
                });
                var item = datas[index];
                if (item && item.count) {
                    result.push(item.count);
                } else {
                    result.push(0);
                }
            }
            return result;
        },

        setEchart(dateStrs, list) {
            var chartOption = {
                title: {
                    text: '营业额统计',
                    subtext: '单位 / 元'
                },
                tooltip: {
                    trigger: 'axis'
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
                            type: ['line', 'bar']
                        },
                        calculable: true,
                        restore: {
                            show: true
                        },
                        saveAsImage: {
                            show: true
                        }
                    },
                    x: document.body.clientWidth - 520 + 'px' //距离X轴多远
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        data: dateStrs
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: '营业额',
                        type: 'line',
                        data: list,
                        smooth: true,
                        barGap: 0,
                        color: '#409EFF',
                        markPoint: {
                            data: [
                                {
                                    type: 'max',
                                    name: '最大值'
                                },
                                {
                                    type: 'min',
                                    name: '最小值'
                                }
                            ]
                        },
                        markLine: {
                            data: [
                                {
                                    type: 'average',
                                    name: '平均值'
                                }
                            ]
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    {
                                        offset: 0,
                                        color: 'rgb(66, 158, 253, 0.4)'
                                    },
                                    {
                                        offset: 0.4,
                                        color: 'rgb(66, 158, 253, 0.2)'
                                    },
                                    {
                                        offset: 1,
                                        color: 'rgb(66, 158, 253, 0)'
                                    }
                                ])
                            }
                        }, //填充区域样式
                        lineStyle: {
                            color: '#409EFF',
                            width: 1
                        } //线条的样式
                    }
                ]
            };
            // 基于准备好的dom，初始化echarts实例
            let chart = echarts.init(document.getElementById('profit_data'));
            // 绘制图表
            chart.setOption(chartOption);
        }
    }
};
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
.from_menu {
    display: flex;
    line-height: 60px;
    align-items: center;
    justify-content: space-between;
}
</style>
