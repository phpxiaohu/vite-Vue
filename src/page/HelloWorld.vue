<template>
  <h3>{{ msg }} AbortController  signal</h3>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> {{ num.count }} to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
    >create-vue</a>, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
    >Vue Docs Scaling up Guide</a>.
  </p>
  <p @click="handleBuyerInfo" class="read-the-docs">Click on the Vite and Vue logos to learn more</p>

  <img @click="handleCalll" :src="userInfo?.avatar" class="avatar" alt="🍍用户头像">

  <div
    @click="handleShallow"
    class="shallow"
  >{{ shallow.age }} {{ shallow.member.sister }}</div>
  <div @click="handleRecorder" class="shrink property">录音</div>
</template>

<script setup>
import {
  inject, ref, readonly,
  shallowRef, triggerRef, shallowReadonly,
  defineModel, onMounted
} from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { getUser } from '@/api/user.js'
const navigateTo = inject('navigateTo'); // 注入路由方法

let msg = ref('')
const count = ref(0)

const { userInfo = {} } = storeToRefs(useUserStore())
// 跳转通话
const handleCalll = () => {
  navigateTo('/audioCall')
}
// 跳转录音
const handleRecorder = () => {
  navigateTo('/mediaRecorder')
}

let num = readonly({ count })
const handleBuyerInfo = () => {
  // navigateTo('/buyerInfo')
  navigateTo('/positionStiky')
  num.count++ // readonly 不会改变

  shallowReadonly(num)
}

const shallow = shallowRef({
  name: '张三',
  age: 18,
  member: {
    sister: '小芳',
    brother: '小王'
  }
})
const handleShallow = () => {
  shallow.value.age = 20
  shallow.value.member =  { sister: '阿当' }
  // 强制触发依赖于一个浅层 ref
  triggerRef(shallow)
  // 这里才会改变视图更新
  // shallow.value = { age: 30, member: { sister: '阿当' } }
  console.log(shallow);
}

onMounted(() => {
  // fetch('/').then(res => { console.log(new Date(res.headers.get('Date'))) })
  /*getUser().then(({ data }) => {
    sessionStorage.setItem('userInfo', JSON.stringify(data))
  })*/
})
</script>

<style scoped>
.read-the-docs, p {
  color: var(--xh-text-color);
}
.avatar {
  width: 100px;
}
@property --gradient {
  syntax: "<color>";
  inherits: false;
  initial-value: #ad92ff;
}
.property {
  /*width: 100px;
  height: 100px;*/
  background: linear-gradient(#fff, var(--gradient));
  transition: --gradient 2s;
  &:hover {
    --gradient: #91ff6b;
  }
}
</style>