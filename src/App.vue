<template>
  <div>
    <CommonHeader />
    <router-view :key="$route.fullPath" />
    <ChatBot />
  </div>
</template>

<script setup>
import CommonHeader from '../components/CommonHeader.vue'
import ChatBot from '../components/ChatBot.vue'
</script>
