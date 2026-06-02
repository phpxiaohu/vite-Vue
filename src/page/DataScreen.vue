<template>
  <div class="data-screen">
    <!-- 顶部标题区域 -->
    <header class="screen-header">
      <div class="header-decoration left"></div>
      <h1 class="screen-title">数据可视化监控平台</h1>
      <div class="header-decoration right"></div>
      <div class="screen-time">{{ currentTime }}</div>
    </header>
    <!-- 主体内容区 -->
    <main class="screen-body">
      <!-- 左侧区域 -->
      <section class="left-panel">
        <!-- 数据统计卡片 -->
        <div class="panel-card">
          <div class="card-header">
            <span class="card-title">核心指标</span>
          </div>
          <div class="card-content">
            <div class="stats-grid">
              <div class="stat-item" v-for="(stat, index) in statsData" :key="index">
                <Statistic :color=stat.color :value="stat.value"></Statistic>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>
        <!-- 折线图 -->
        <div class="panel-card">
          <div class="card-header">
            <span class="card-title">趋势分析</span>
          </div>
          <div class="card-content">
            <div ref="lineChartRef" class="chart-container"></div>
          </div>
        </div>
        <!-- 排行榜 -->
        <div class="panel-card">
          <div class="card-header">
            <span class="card-title">实时排行</span>
          </div>
          <div class="card-content">
            <div class="ranking-list">
              <div
                  class="ranking-item"
                  v-for="(item, index) in rankingData"
                  :key="index"
              >
                <div class="ranking-rank" :class="'rank-' + (index + 1)">
                  {{ index + 1 }}
                </div>
                <div class="ranking-info">
                  <div class="ranking-name">{{ item.name }}</div>
                  <div class="ranking-bar">
                    <div
                        class="ranking-progress"
                        :style="{ width: item.percent + '%' }"
                    ></div>
                  </div>
                </div>
                <div class="ranking-value">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- 中间区域 -->
      <section class="center-panel">
        <!-- 中国地图 -->
        <div class="flexitemv panel-card">
          <div class="card-header">
            <span class="card-title">全国数据分布</span>
          </div>
          <div class="flexitem card-content">
            <div ref="mapChartRef" class="map-container"></div>
          </div>
        </div>
        <!-- 底部柱状图 -->
        <div class="panel-card">
          <div class="card-header">
            <span class="card-title">周度对比</span>
          </div>
          <div class="card-content">
            <div ref="barChartRef" class="chart-container"></div>
          </div>
        </div>
      </section>
      <!-- 右侧区域 -->
      <section class="right-panel">
        <!-- 饼图 -->
        <div class="panel-card">
          <div class="card-header">
            <span class="card-title">分布统计</span>
          </div>
          <div class="card-content">
            <div ref="pieChartRef" class="chart-container"></div>
          </div>
        </div>
        <!-- 环形图 -->
        <div class="panel-card">
          <div class="card-header">
            <span class="card-title">完成率分析</span>
          </div>
          <div class="card-content">
            <div ref="gaugeChartRef" class="chart-container"></div>
          </div>
        </div>
        <!-- 动态列表 -->
        <div class="panel-card">
          <div class="card-header">
            <span class="card-title">最新动态</span>
          </div>
          <div class="card-content">
            <div class="dynamic-list">
              <div
                class="dynamic-item"
                v-for="(item, index) in dynamicData"
                :key="index"
              >
                <div class="dynamic-dot"></div>
                <div class="dynamic-content">
                  <div class="dynamic-text">{{ item.text }}</div>
                  <div class="dynamic-time">{{ item.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import Statistic from "@/components/Statistic.vue";

defineOptions({ name: 'DataScreen' })

const currentTime = ref('')
let timer = null
let resizeObserver = null

// 图表引用
const lineChartRef = ref(null)
const pieChartRef = ref(null)
const barChartRef = ref(null)
const mapChartRef = ref(null)
const gaugeChartRef = ref(null)

let lineChart = null
let pieChart = null
let barChart = null
let mapChart = null
let gaugeChart = null

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 统计数据
const statsData = ref([
  { label: '用户总数', value: '52,841', color: '#00f2fe' },
  { label: '活跃用户', value: '38,256', color: '#43e97b' },
  { label: '新增用户', value: '1,234', color: '#fa709a' },
  { label: '转化率', value: '68.5%', color: '#fee140' }
])

// 排行榜数据
const rankingData = ref([
  { name: '产品A', value: '12,345', percent: 95 },
  { name: '产品B', value: '10,234', percent: 82 },
  { name: '产品C', value: '8,567', percent: 68 },
  { name: '产品D', value: '6,567', percent: 58 }
])

// 动态数据
const dynamicData = ref([
  { text: '新用户注册完成', time: '10:23:45' },
  { text: '订单 #12345 支付成功', time: '10:22:30' },
  { text: '商品库存预警', time: '10:21:15' },
  { text: '系统自动备份完成', time: '10:20:00' }
])

// 初始化折线图
const initLineChart = () => {
  if (!lineChartRef.value) return

  lineChart = echarts.init(lineChartRef.value)
  const mobile = isMobile()
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00f2fe',
      textStyle: { color: '#fff', fontSize: mobile ? 10 : 12 }
    },
    grid: {
      left: mobile ? '8%' : '3%',
      right: mobile ? '5%' : '4%',
      bottom: mobile ? '8%' : '3%',
      top: mobile ? '12%' : '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: mobile ? 10 : 12,
        interval: mobile ? 1 : 0 // 移动端隔一个显示一个标签
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: mobile ? 10 : 12
      },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
    },
    series: [{
      data: [820, 932, 901, 1234, 1290, 1330, 1320],
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: mobile ? 6 : 8,
      lineStyle: {
        color: '#00f2fe',
        width: mobile ? 2 : 3
      },
      itemStyle: {
        color: '#00f2fe',
        borderColor: '#fff',
        borderWidth: 2
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 242, 254, 0.5)' },
          { offset: 1, color: 'rgba(0, 242, 254, 0.05)' }
        ])
      }
    }]
  }
  lineChart.setOption(option)
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)
  const mobile = isMobile()
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00f2fe',
      textStyle: { color: '#fff', fontSize: mobile ? 10 : 12 }
    },
    legend: {
      orient: mobile ? 'horizontal' : 'vertical',
      right: mobile ? 'center' : '5%',
      top: mobile ? 'bottom' : 'center',
      bottom: mobile ? 0 : undefined,
      textStyle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: mobile ? 10 : 12
      },
      itemWidth: mobile ? 10 : 14,
      itemHeight: mobile ? 10 : 14
    },
    series: [{
      type: 'pie',
      radius: mobile ? ['35%', '60%'] : ['40%', '70%'],
      center: mobile ? ['50%', '45%'] : ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#0c0e1b',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: mobile ? 14 : 16,
          fontWeight: 'bold',
          color: '#fff'
        }
      },
      data: [
        { value: 1048, name: '搜索引擎', itemStyle: { color: '#00f2fe' } },
        { value: 735, name: '直接访问', itemStyle: { color: '#43e97b' } },
        { value: 580, name: '邮件营销', itemStyle: { color: '#fa709a' } },
        { value: 484, name: '联盟广告', itemStyle: { color: '#fee140' } },
        { value: 300, name: '视频广告', itemStyle: { color: '#a18cd1' } }
      ]
    }]
  }
  pieChart.setOption(option)
}

// 初始化柱状图
const initBarChart = () => {
  if (!barChartRef.value) return

  barChart = echarts.init(barChartRef.value)
  const mobile = isMobile()
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00f2fe',
      textStyle: { color: '#fff', fontSize: mobile ? 10 : 12 }
    },
    grid: {
      left: mobile ? '8%' : '3%',
      right: mobile ? '5%' : '4%',
      bottom: mobile ? '8%' : '3%',
      top: mobile ? '12%' : '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: mobile ? 10 : 12,
        interval: mobile ? 1 : 0
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: mobile ? 10 : 12
      },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
    },
    series: [{
      data: [320, 332, 301, 334, 390, 330, 320],
      type: 'bar',
      barWidth: mobile ? '50%' : '40%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#00f2fe' },
          { offset: 1, color: '#00c6ff' }
        ]),
        borderRadius: [6, 6, 0, 0]
      }
    }]
  }
  barChart.setOption(option)
}

// 省会城市坐标数据
const cityCoords = {
  '北京': [116.407526, 39.90403],
  '上海': [121.473701, 31.230416],
  '广州': [113.264385, 23.129112],
  '深圳': [114.057868, 22.543099],
  '成都': [104.066541, 30.572269],
  '杭州': [120.15507, 30.274084],
  '重庆': [106.551556, 29.563009],
  '西安': [108.93977, 34.341574],
  '苏州': [120.585315, 31.298886],
  '武汉': [114.305393, 30.593099],
  '厦门': [118.089425, 24.479834],
  '南京': [118.796877, 32.060255],
  '天津': [117.200983, 39.084158],
  '郑州': [113.625368, 34.7466],
  '长沙': [112.938814, 28.228209],
  '沈阳': [123.431474, 41.805698],
  '青岛': [120.382612, 36.067108],
  '宁波': [121.54399, 29.868336],
  '济南': [117.12009, 36.6512],
  '哈尔滨': [126.534967, 45.803775],
  '福州': [119.296494, 26.074508],
  '石家庄': [114.51486, 38.042307],
  '昆明': [102.832891, 24.880095],
  '大连': [121.614682, 38.914003],
  '长春': [125.3245, 43.886841],
  '南昌': [115.858198, 28.682892],
  '贵阳': [106.630154, 26.647661],
  '南宁': [108.366543, 22.817002],
  '太原': [112.549248, 37.857014],
  '乌鲁木齐': [87.616848, 43.825592],
  '兰州': [103.834303, 36.061089],
  '呼和浩特': [111.75199, 40.842356],
  '银川': [106.230909, 38.487193],
  '西宁': [101.778916, 36.623178],
  '拉萨': [91.132212, 29.660361],
  '海口': [110.198293, 20.044002]
}

// 生成航线数据（以北京为中心）
const generateLinesData = () => {
  const centerCity = '北京'
  const lines = []
  const coords = Object.values(cityCoords)

  Object.keys(cityCoords).forEach(city => {
    // 随机获取 cityCoords 对象中的一个
    const coordIndex = Math.floor(Math.random() * 36)
    if (city !== centerCity) {
      lines.push({
        coords: [
          coords[coordIndex],
          cityCoords[city]
        ]
      })
    }
  })
  // console.log(lines);
  return lines
}

// 生成散点数据
const generateScatterData = () => {
  return Object.keys(cityCoords).map(city => ({
    name: city,
    value: [...cityCoords[city], Math.floor(Math.random() * 1000) + 100]
  }))
}

// 初始化中国地图（带航线动画）
const initMapChart = async () => {
  if (!mapChartRef.value) return

  mapChart = echarts.init(mapChartRef.value)
  const mobile = isMobile()

  try {
    // 获取中国地图 JSON 数据
    const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
    const chinaGeoJson = await response.json()

    // 注册地图
    echarts.registerMap('china', chinaGeoJson)

    const linesData = generateLinesData()
    const scatterData = generateScatterData()

    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00f2fe',
        textStyle: { color: '#fff', fontSize: mobile ? 10 : 12 },
        formatter: function(params) {
          if (params.seriesType === 'effectScatter') {
            return `${params.name}<br/>数值: ${params.value[2]}`
          }
          return params.name
        }
      },
      geo: {
        map: 'china',
        roam: !mobile, // 移动端禁用拖拽缩放，避免误操作
        zoom: mobile ? 1 : 1.2,
        itemStyle: {
          areaColor: 'rgba(0, 20, 40, 0.6)',
          borderColor: '#00f2fe',
          borderWidth: mobile ? 1 : 1.5,
          shadowColor: 'rgba(0, 242, 254, 0.5)',
          shadowBlur: 15
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontSize: mobile ? 10 : 12
          },
          itemStyle: {
            areaColor: 'rgba(0, 242, 254, 0.2)',
            borderColor: '#43e97b',
            borderWidth: 2,
            shadowColor: 'rgba(67, 233, 123, 0.8)',
            shadowBlur: 25
          }
        }
      },
      series: [
        // 航线
        {
          name: '航线',
          type: 'lines',
          zlevel: 1,
          effect: {
            show: true,
            period: 6,
            trailLength: 0.7,
            color: '#00f2fe',
            symbolSize: mobile ? 2 : 3
          },
          lineStyle: {
            color: '#b9fcff',
            width: 0,
            curveness: 0.2
          },
          data: linesData
        },
        // 航迹线
        {
          name: '航迹',
          type: 'lines',
          zlevel: 2,
          effect: {
            show: true,
            period: 6,
            trailLength: 0,
            symbol: 'arrow',
            symbolSize: mobile ? 4 : 6
          },
          lineStyle: {
            color: '#00f2fe',
            width: mobile ? 0.5 : 1,
            opacity: 0.6,
            curveness: 0.2
          },
          data: linesData
        },
        // 城市散点
        {
          name: '城市',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 2,
          rippleEffect: {
            brushType: 'stroke',
            scale: mobile ? 3 : 4
          },
          emphasis: {
            label: {
              show: true,
              position: 'right',
              formatter: '{b}',
              color: '#fff',
              fontSize: mobile ? 10 : 12
            }
          },
          symbolSize: function (val) {
            return val[2] / (mobile ? 100 : 80)
          },
          itemStyle: {
            color: '#43e97b',
            shadowBlur: 10,
            shadowColor: '#43e97b'
          },
          data: scatterData
        }
      ]
    }

    mapChart.setOption(option)
  } catch (error) {
    console.error('加载地图数据失败:', error)
    // 如果加载失败，显示提示信息
    mapChart.setOption({
      title: {
        text: '地图加载失败',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#fff',
          fontSize: mobile ? 14 : 16
        }
      }
    })
  }
}

// 初始化仪表盘
const initGaugeChart = () => {
  if (!gaugeChartRef.value) return

  gaugeChart = echarts.init(gaugeChartRef.value)
  const mobile = isMobile()
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 5, // 仪表盘刻度轴分割成的段数
      radius: mobile ? '100%' : '120%',
      center: ['50%', mobile ? '75%' : '80%'],
      progress: {
        show: true,
        width: mobile ? 15 : 20,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#43e97b' },
            { offset: 1, color: '#00f2fe' }
          ])
        }
      },
      // 指针
      pointer: {
        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        length: '12%',
        width: mobile ? 15 : 20,
        offsetCenter: [0, '-60%'],
        itemStyle: {
          color: 'auto'
        }
      },
      // 仪表盘轴线
      axisLine: {
        lineStyle: {
          width: mobile ? 14 : 18,
          color: [[1, 'rgba(255, 255, 255, 0.1)']]
        }
      },
      // 仪表盘刻度
      axisTick: {
        length: mobile ? 10 : 12,
        lineStyle: {
          color: 'auto',
          width: 2
        }
      },
      // 仪表盘分隔线
      splitLine: {
        length: mobile ? 15 : 20,
        lineStyle: {
          color: 'auto',
          width: mobile ? 4 : 5
        }
      },
      // 仪表盘标签
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: mobile ? 10 : 12,
        distance: -50
      },
      // 仪表盘标题
      title: {
        offsetCenter: [0, '-30%'],
        fontSize: mobile ? 14 : 16,
        color: 'rgba(255, 255, 255, 0.9)'
      },
      // 仪表盘数值
      detail: {
        fontSize: mobile ? 24 : 30,
        offsetCenter: [0, '0%'],
        valueAnimation: true,
        formatter: '{value}%',
        color: '#00f2fe',
        fontWeight: 'bold'
      },
      // 仪表盘数据
      data: [{
        value: 68.5,
        name: '完成率'
      }]
    }]
  }
  gaugeChart.setOption(option)
}

// 窗口resize处理
const handleResize = () => {
  lineChart?.resize()
  pieChart?.resize()
  barChart?.resize()
  mapChart?.resize()
  gaugeChart?.resize()
}

// 监听 main 元素宽度变化
const observeMainElement = () => {
  const mainElement = document.querySelector('.main-body')
  if (!mainElement) return

  // 创建 ResizeObserver
  resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect
      // 防抖处理，避免频繁调用
      debounce(handleResize, 100)()
    }
  })

  // 开始观察
  resizeObserver.observe(mainElement)
}

// 防抖函数
const debounce = (fn, delay) => {
  let timeoutId = null
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}

// 检测设备类型
const isMobile = () => {
  return window.innerWidth <= 768
}

// 重新初始化所有图表（用于设备类型切换时）
const reinitCharts = () => {
  initLineChart()
  initPieChart()
  initBarChart()
  initMapChart()
  initGaugeChart()
}

// 存储之前的设备类型，用于检测设备切换
let previousIsMobile = false

onMounted(async () => {
  updateTime()
  timer = setInterval(updateTime, 1000)

  await nextTick()

  await reinitCharts()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  // 存储之前的设备类型，用于检测设备切换
  previousIsMobile = isMobile()

  // 监听窗口大小变化以检测设备类型切换
  window.addEventListener('resize', () => {
    const currentIsMobile = isMobile()
    if (currentIsMobile !== previousIsMobile) {
      // 设备类型发生变化，重新初始化图表
      debounce(reinitCharts, 300)()
      previousIsMobile = currentIsMobile
    }
  })

  // 监听 main 元素宽度变化
  observeMainElement()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }

  lineChart?.dispose()
  pieChart?.dispose()
  barChart?.dispose()
  mapChart?.dispose()
  gaugeChart?.dispose()

  window.removeEventListener('resize', handleResize)

  // 断开 ResizeObserver 观察
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<style scoped>
.data-screen {
  background: linear-gradient(135deg, #0c0e1b 0%, #1a1d3a 50%, #0c0e1b 100%);
  color: #fff;
  padding: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  position: relative;
}

/* 背景网格效果 */
.data-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(0, 242, 254, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 242, 254, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

.screen-header {
  text-align: center;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
}

.header-decoration {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 300px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00f2fe, transparent);
}

.header-decoration.left {
  left: 10%;
}

.header-decoration.right {
  right: 10%;
}

.screen-title {
  font-size: 36px;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(90deg, #00f2fe 0%, #43e97b 50%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 4px;
  text-shadow: 0 0 30px rgba(0, 242, 254, 0.5);
}

.screen-time {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #00f2fe;
  font-family: 'Courier New', monospace;
  background: rgba(0, 242, 254, 0.1);
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 242, 254, 0.3);
}

.screen-body {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  gap: 10px;
  max-width: 1920px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.center-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.panel-card {
  background: rgba(0, 20, 40, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(0, 242, 254, 0.2);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.1), inset 0 0 10px rgba(0, 242, 254, 0.05);
  overflow: hidden;
  transition: all 0.3s;
}

.panel-card:hover {
  border-color: rgba(0, 242, 254, 0.4);
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.2), inset 0 0 30px rgba(0, 242, 254, 0.1);
}

.card-header {
  padding: 10px 16px;
  background: linear-gradient(90deg, rgba(0, 242, 254, 0.1), transparent);
  border-bottom: 1px solid rgba(0, 242, 254, 0.2);
  position: relative;
}

.card-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #00f2fe, #43e97b);
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #00f2fe;
  letter-spacing: 2px;
}

.card-content {
  padding: 10px;
}

/* 统计数据网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: rgba(0, 242, 254, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(0, 242, 254, 0.1);
  transition: all 0.3s;
}

.stat-item:hover {
  background: rgba(0, 242, 254, 0.1);
  transform: translateY(-2px);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 200px;
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: 590px;
  position: relative;
}

/* 排行榜 */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 242, 254, 0.05);
  border-radius: 6px;
  transition: all 0.3s;
}

.ranking-item:hover {
  background: rgba(0, 242, 254, 0.1);
  transform: translateX(5px);
}

.ranking-rank {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.1);
}

.ranking-info {
  flex: 1;
}

.ranking-name {
  font-size: 14px;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.9);
}

.ranking-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.ranking-progress {
  height: 100%;
  background: linear-gradient(90deg, #00f2fe, #43e97b);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.ranking-value {
  font-size: 16px;
  font-weight: bold;
  color: #00f2fe;
  font-family: 'Courier New', monospace;
  min-width: 80px;
  text-align: right;
}

/* 动态列表 */
.dynamic-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dynamic-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: rgba(0, 242, 254, 0.03);
  border-radius: 4px;
  animation: slideIn 0.5s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.dynamic-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00f2fe;
  margin-top: 6px;
  box-shadow: 0 0 10px #00f2fe;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

.dynamic-content {
  flex: 1;
}

.dynamic-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4px;
}

.dynamic-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Courier New', monospace;
}

/* 响应式设计 */

/* 平板端适配 (768px - 1400px) */
@media (max-width: 1400px) {
  .screen-body {
    grid-template-columns: 1fr 1.2fr 1fr;
    gap: 8px;
  }

  .screen-title {
    font-size: 30px;
  }

  .chart-container {
    height: 180px;
  }

  .map-container {
    min-height: 500px;
  }
}

/* 小平板和大手机适配 (768px - 1200px) */
@media (max-width: 1200px) {
  .data-screen {
    padding: 8px;
  }

  .screen-body {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .center-panel {
    grid-column: 1 / -1;
    order: -1;
  }

  .screen-title {
    font-size: 24px;
    letter-spacing: 2px;
  }

  .header-decoration {
    width: 100px;
  }

  .screen-time {
    position: static;
    transform: none;
    display: inline-block;
    margin-top: 10px;
    font-size: 14px;
    padding: 6px 12px;
  }

  .chart-container {
    height: 160px;
  }

  .map-container {
    min-height: 400px;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-item {
    padding: 12px;
  }

  .stat-value {
    font-size: 24px;
  }
}

/* 手机端适配 (最大 768px) */
@media (max-width: 768px) {
  .data-screen {
    padding: 5px;
  }

  .screen-header {
    margin-bottom: 8px;
  }

  .screen-title {
    font-size: 20px;
    letter-spacing: 1px;
  }

  .header-decoration {
    width: 60px;
    height: 1px;
  }

  .screen-body {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .left-panel,
  .right-panel,
  .center-panel {
    gap: 6px;
  }

  /* 调整面板顺序：地图优先 */
  .center-panel {
    order: -1;
  }

  .panel-card {
    border-radius: 6px;
  }

  .card-header {
    padding: 8px 12px;
  }

  .card-title {
    font-size: 14px;
    letter-spacing: 1px;
  }

  .card-content {
    padding: 8px;
  }

  /* 统计卡片调整为单列 */
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .stat-item {
    padding: 10px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 12px;
  }

  /* 图表高度调整 */
  .chart-container {
    height: 180px;
  }

  .map-container {
    min-height: 300px;
  }

  /* 排行榜优化 */
  .ranking-item {
    padding: 10px;
    gap: 8px;
  }

  .ranking-rank {
    width: 26px;
    height: 26px;
    font-size: 12px;
  }

  .ranking-name {
    font-size: 13px;
  }

  .ranking-value {
    font-size: 14px;
    min-width: 60px;
  }

  /* 动态列表优化 */
  .dynamic-item {
    padding: 8px;
    gap: 8px;
  }

  .dynamic-text {
    font-size: 12px;
  }

  .dynamic-time {
    font-size: 10px;
  }

  .dynamic-dot {
    width: 6px;
    height: 6px;
    margin-top: 5px;
  }
}

/* 小屏幕手机适配 (最大 480px) */
@media (max-width: 480px) {
  .data-screen {
    padding: 4px;
  }

  .screen-title {
    font-size: 18px;
  }

  .header-decoration {
    width: 40px;
  }

  .screen-time {
    font-size: 12px;
    padding: 4px 8px;
  }

  .screen-body {
    gap: 5px;
  }

  .left-panel,
  .right-panel,
  .center-panel {
    gap: 5px;
  }

  .card-header {
    padding: 6px 10px;
  }

  .card-title {
    font-size: 13px;
  }

  .card-content {
    padding: 6px;
  }

  /* 统计卡片保持两列但更紧凑 */
  .stats-grid {
    gap: 6px;
  }

  .stat-item {
    padding: 8px;
  }

  .stat-value {
    font-size: 18px;
  }

  .stat-label {
    font-size: 11px;
  }

  /* 图表高度进一步调整 */
  .chart-container {
    height: 160px;
  }

  .map-container {
    min-height: 250px;
  }

  /* 排行榜更紧凑 */
  .ranking-list {
    gap: 8px;
  }

  .ranking-item {
    padding: 8px;
  }

  .ranking-rank {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }

  .ranking-name {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .ranking-bar {
    height: 4px;
  }

  .ranking-value {
    font-size: 13px;
    min-width: 50px;
  }

  /* 动态列表更紧凑 */
  .dynamic-list {
    gap: 6px;
  }

  .dynamic-item {
    padding: 6px;
  }

  .dynamic-text {
    font-size: 11px;
  }

  .dynamic-time {
    font-size: 9px;
  }
}
</style>