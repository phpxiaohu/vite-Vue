<template>
  <div class="pet-adoption-page">
    <!-- 顶部横幅 -->
    <section class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-decoration">🐾</div>
        <h1 class="hero-title">给TA一个温暖的家</h1>
        <p class="hero-subtitle">每一个生命都值得被爱，快来领养你的专属小伙伴吧！</p>
        <button class="adopt-btn" @click="scrollToPets">开始领养之旅 💕</button>
      </div>
    </section>

    <!-- 特色介绍 -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">为什么选择领养 🐱🐶</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">❤️</div>
            <h3>拯救生命</h3>
            <p>给流浪动物一个温暖的家，让TA不再孤单</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>经济实惠</h3>
            <p>领养费用远低于购买，还包含疫苗和绝育</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏥</div>
            <h3>健康保障</h3>
            <p>所有宠物都经过健康检查和疫苗接种</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👨👩👧👦</div>
            <h3>增添欢乐</h3>
            <p>宠物是家庭的一员，带来无尽的快乐和陪伴</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 宠物列表 -->
    <section class="pets-section" id="pets">
      <div class="container">
        <h2 class="section-title">等待领养的小可爱们 🐾</h2>
        <div class="filter-bar">
          <button
            v-for="filter in filters"
            :key="filter.value"
            :class="['filter-btn', { active: activeFilter === filter.value }]"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
        <div class="pets-grid">
          <div
            v-for="pet in filteredPets"
            :key="pet.id"
            class="pet-card"
            @click="showPetDetail(pet)"
          >
            <div class="pet-image-wrapper">
              <img :src="pet.image" :alt="pet.name" class="pet-image">
              <div class="pet-badge" :class="pet.status">{{ pet.statusText }}</div>
            </div>
            <div class="pet-info">
              <div class="pet-name">{{ pet.name }} <span class="pet-age">{{ pet.age }}</span></div>
              <div class="pet-breed">{{ pet.breed }}</div>
              <div class="pet-tags">
                <span v-for="tag in pet.tags" :key="tag" class="pet-tag">{{ tag }}</span>
              </div>
            </div>
            <button class="adopt-pet-btn">立即领养</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 领养流程 -->
    <section class="process-section">
      <div class="container">
        <h2 class="section-title">领养流程 📋</h2>
        <div class="process-steps">
          <div class="process-step" v-for="(step, index) in processSteps" :key="index">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
            <div v-if="index < processSteps.length - 1" class="step-arrow">→</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系表单 -->
    <section class="contact-section">
      <div class="container">
        <h2 class="section-title">联系我们 📞</h2>
        <div class="contact-content">
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-icon">📍</span>
              <span>地址：阳光宠物救助中心</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📱</span>
              <span>电话：400-888-8888</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <span>邮箱：adopt@pet-rescue.com</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">⏰</span>
              <span>开放时间：9:00-18:00</span>
            </div>
          </div>
          <form class="contact-form" @submit.prevent="submitForm">
            <div class="form-group">
              <input type="text" v-model="form.name" placeholder="您的姓名" required>
            </div>
            <div class="form-group">
              <input type="tel" v-model="form.phone" placeholder="联系电话" required>
            </div>
            <div class="form-group">
              <select v-model="form.petType" required>
                <option value="">选择意向宠物类型</option>
                <option value="cat">猫咪</option>
                <option value="dog">狗狗</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div class="form-group">
              <textarea v-model="form.message" placeholder="留言内容（可选）"></textarea>
            </div>
            <button type="submit" class="submit-btn">提交申请</button>
          </form>
        </div>
      </div>
    </section>

    <!-- 宠物详情弹窗 -->
    <div v-if="selectedPet" class="pet-modal" @click.self="selectedPet = null">
      <div class="modal-content">
        <button class="close-btn" @click="selectedPet = null">✕</button>
        <div class="modal-image">
          <img :src="selectedPet.image" :alt="selectedPet.name">
        </div>
        <div class="modal-info">
          <h2>{{ selectedPet.name }} <span class="modal-age">{{ selectedPet.age }}</span></h2>
          <p class="modal-breed">{{ selectedPet.breed }}</p>
          <div class="modal-tags">
            <span v-for="tag in selectedPet.tags" :key="tag" class="modal-tag">{{ tag }}</span>
          </div>
          <p class="modal-description">{{ selectedPet.description }}</p>
          <button class="modal-adopt-btn">申请领养 {{ selectedPet.name }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeFilter = ref('all')
const filters = [
  { label: '全部', value: 'all' },
  { label: '猫咪', value: 'cat' },
  { label: '狗狗', value: 'dog' },
  { label: '其他', value: 'other' }
]

const pets = ref([
  {
    id: 1,
    name: '小橘',
    breed: '橘猫',
    age: '2岁',
    type: 'cat',
    status: 'available',
    statusText: '可领养',
    image: 'https://a0ai.marscode.cn/api/ide/v1/text_to_image?prompt=cute%20orange%20tabby%20cat%20sitting%20looking%20at%20camera%20warm%20lighting%20soft%20focus&image_size=landscape_4_3',
    tags: ['温顺', '亲人', '爱撒娇'],
    description: '小橘是一只非常亲人的橘猫，喜欢被抚摸和抱抱。性格温顺，从不乱发脾气，是陪伴的好伙伴。'
  },
  {
    id: 2,
    name: '旺财',
    breed: '金毛寻回犬',
    age: '1岁',
    type: 'dog',
    status: 'available',
    statusText: '可领养',
    image: 'https://a0ai.marscode.cn/api/ide/v1/text_to_image?prompt=golden%20retriever%20puppy%20happy%20smiling%20playful%20warm%20sunlight&image_size=landscape_4_3',
    tags: ['活泼', '聪明', '友善'],
    description: '旺财是一只活泼可爱的金毛幼犬，非常聪明，学东西很快。喜欢户外活动，是运动爱好者的最佳选择。'
  },
  {
    id: 3,
    name: '雪球',
    breed: '萨摩耶',
    age: '6个月',
    type: 'dog',
    status: 'pending',
    statusText: '待审核',
    image: 'https://a0ai.marscode.cn/api/ide/v1/text_to_image?prompt=samoyed%20puppy%20fluffy%20white%20smiling%20snow%20background&image_size=landscape_4_3',
    tags: ['爱笑', '友善', '精力充沛'],
    description: '雪球是一只笑容灿烂的萨摩耶宝宝，雪白的毛发非常漂亮。性格开朗，喜欢和人互动。'
  },
  {
    id: 4,
    name: '花花',
    breed: '三花猫',
    age: '3岁',
    type: 'cat',
    status: 'available',
    statusText: '可领养',
    image: 'https://a0ai.marscode.cn/api/ide/v1/text_to_image?prompt=calico%20cat%20beautiful%20tri%20color%20elegant%20sitting%20soft%20light&image_size=landscape_4_3',
    tags: ['优雅', '安静', '独立'],
    description: '花花是一只优雅的三花猫，性格独立但不冷漠。喜欢安静地待在窗边晒太阳，适合喜欢安静的家庭。'
  },
  {
    id: 5,
    name: '布丁',
    breed: '仓鼠',
    age: '3个月',
    type: 'other',
    status: 'available',
    statusText: '可领养',
    image: 'https://a0ai.marscode.cn/api/ide/v1/text_to_image?prompt=cute%20hamster%20fluffy%20golden%20syrian%20hamster%20eating%20seed%20adorable&image_size=landscape_4_3',
    tags: ['小巧', '可爱', '易照顾'],
    description: '布丁是一只毛茸茸的金丝熊仓鼠，非常可爱。不需要太多空间，适合小户型养宠。'
  },
  {
    id: 6,
    name: '豆豆',
    breed: '泰迪犬',
    age: '2岁',
    type: 'dog',
    status: 'available',
    statusText: '可领养',
    image: 'https://a0ai.marscode.cn/api/ide/v1/text_to_image?prompt=toy%20poodle%20cute%20groomed%20curly%20hair%20standing%20pose&image_size=landscape_4_3',
    tags: ['聪明', '粘人', '不掉毛'],
    description: '豆豆是一只聪明可爱的泰迪犬，体型小巧，不掉毛。非常粘人，喜欢跟主人在一起。'
  }
])

const filteredPets = computed(() => {
  if (activeFilter.value === 'all') return pets.value
  return pets.value.filter(pet => pet.type === activeFilter.value)
})

const processSteps = [
  { title: '浏览宠物', description: '在网站上浏览等待领养的宠物，选择心仪的小伙伴' },
  { title: '提交申请', description: '填写领养申请表，提供个人信息和居住环境' },
  { title: '审核家访', description: '工作人员审核申请并进行家访，确保环境适合养宠' },
  { title: '接TA回家', description: '审核通过后，签署领养协议，接宠物回家' }
]

const form = ref({
  name: '',
  phone: '',
  petType: '',
  message: ''
})

const selectedPet = ref(null)

const showPetDetail = (pet) => {
  selectedPet.value = pet
}

const submitForm = () => {
  alert('感谢您的领养申请！我们会尽快与您联系。')
  form.value = { name: '', phone: '', petType: '', message: '' }
}

const scrollToPets = () => {
  document.getElementById('pets')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.pet-adoption-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff9f0 0%, #fff 100%);
}

.hero-section {
  position: relative;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 20px;
}

.hero-decoration {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero-title {
  font-size: 2.5rem;
  color: #ff6b6b;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 30px;
}

.adopt-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%);
  color: white;
  border: none;
  padding: 16px 40px;
  font-size: 1.1rem;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  transition: transform 0.3s, box-shadow 0.3s;
}

.adopt-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  color: #ff6b6b;
  margin-bottom: 40px;
}

.features-section {
  background: #fff;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.feature-card {
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.feature-card h3 {
  color: #ff6b6b;
  margin-bottom: 12px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.pets-section {
  background: linear-gradient(180deg, #fff 0%, #fff5f5 100%);
}

.filter-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 24px;
  border-radius: 30px;
  border: 2px solid #ff6b6b;
  background: white;
  color: #ff6b6b;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn.active,
.filter-btn:hover {
  background: #ff6b6b;
  color: white;
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.pet-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.pet-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}

.pet-image-wrapper {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pet-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.pet-badge.available {
  background: #7bed9f;
  color: #2ed573;
}

.pet-badge.pending {
  background: #fff280;
  color: #ffa502;
}

.pet-info {
  padding: 20px;
}

.pet-name {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.pet-age {
  font-size: 0.9rem;
  color: #ff6b6b;
  margin-left: 8px;
}

.pet-breed {
  color: #999;
  margin-bottom: 12px;
}

.pet-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pet-tag {
  padding: 4px 10px;
  background: #fff5f5;
  color: #ff6b6b;
  border-radius: 12px;
  font-size: 0.8rem;
}

.adopt-pet-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%);
  color: white;
  border: none;
  border-radius: 0 0 20px 20px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.adopt-pet-btn:hover {
  background: linear-gradient(135deg, #ff5252 0%, #ff8f00 100%);
}

.process-section {
  background: #fff;
}

.process-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  position: relative;
}

.process-step {
  text-align: center;
  position: relative;
}

.step-number {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 auto 16px;
}

.step-content h3 {
  color: #ff6b6b;
  margin-bottom: 8px;
}

.step-content p {
  color: #666;
  font-size: 0.9rem;
}

.step-arrow {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  color: #ff6b6b;
  display: none;
}

@media (min-width: 768px) {
  .step-arrow {
    display: block;
  }
}

.contact-section {
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.1rem;
}

.contact-icon {
  font-size: 1.5rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 14px;
  border: 2px solid #ffebef;
  border-radius: 12px;
  background: #fff9f9;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #ff6b6b;
}

.form-group textarea {
  height: 100px;
}

.submit-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
}

.pet-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0,0,0,0.1);
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 10;
}

.modal-image {
  height: 300px;
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-info {
  padding: 30px;
}

.modal-info h2 {
  font-size: 1.8rem;
  color: #ff6b6b;
  margin-bottom: 8px;
}

.modal-age {
  font-size: 1rem;
  color: #999;
  margin-left: 10px;
}

.modal-breed {
  color: #999;
  margin-bottom: 16px;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.modal-tag {
  padding: 6px 14px;
  background: #fff5f5;
  color: #ff6b6b;
  border-radius: 20px;
}

.modal-description {
  color: #666;
  line-height: 1.8;
  margin-bottom: 24px;
}

.modal-adopt-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.modal-adopt-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .contact-content {
    grid-template-columns: 1fr;
  }

  .pets-grid {
    grid-template-columns: 1fr;
  }
}
</style>