<template>
  <div class="md-body">
    <div v-if="isLoading">
      <Spinner />
    </div>
    <div v-else>
      <div class="tweet-menu-wrapper">
        <div class="tweet-menu">
          <select v-model="sortBy" name="sortBy">
            <option value="date">Sort by date</option>
            <option value="likes">Sort by likes</option>
          </select>
        </div>
      </div>

      <div class="tweets__wrapper" v-for="item in dataSortered" :key="item.id">
        <Tweet
          :id="item.id"
          :likes="item.likes"
          :name="item.date"
          :imgUrl="item.avatar"
          @onClick="handleUpdate(item)"
        >
          <div class="md-body" v-html="compiledMarked(item.body)"></div>
        </Tweet>
      </div>
      <button @click="handleModalShow" class="btn btnTweet btnTweetHome">
        New tweet
      </button>
    </div>

    <Modal title="New tweet" v-if="showModal" @onClose="handleModalShow">
      <form @submit.prevent="handleStore">
        <textarea required v-model="tweet.body"></textarea>
        <button type="submit" class="btn btnTweet">Submit</button>
      </form>
    </Modal>
  </div>
</template>

<script>
import marked from 'marked'
import { onMounted, ref, computed, reactive } from 'vue'
import http from '@/http-common'
import Spinner from '@/components/UI/Spinner'
import Modal from '@/components/UI/Modal'
import Tweet from '@/components/UI/Tweet'

export default {
  components: { Spinner, Modal, Tweet },
  setup() {
    const isLoading = ref(true)
    const data = ref([])

    const compiledMarked = text => {
      return marked(text, { santize: true })
    }

    onMounted(() => getTweets())

    const getTweets = () =>
      http
        .get(`/tweets.json`)
        .then(res => {
          const nextData = []

          Object.keys(res.data).forEach(key => {
            const item = res.data[key]
            nextData.push({ id: key, ...item })
          })

          data.value = nextData
          isLoading.value = false
        })
        .catch(e => {
          console.log(e)
        })

    const tweet = reactive({
      body: '',
      // avatar: 'https://tocode.ru/static/_secret/bonuses/1/avatar-1Tq9kaAql.png',
      avatar: `https://avatars.dicebear.com/api/male/${Date.now()}.svg`,
      likes: 0,
      date: new Date(Date.now()).toLocaleString()
    })

    const handleStore = () => {
      http.post(`/tweets.json`, tweet).then(res => {
        tweet.body = ''
        getTweets()
        handleModalShow()
      })
    }

    const sortBy = ref('date')
    const dataSortered = computed(() => {
      return data.value.sort((a, b) => {
        if (a[sortBy.value] < b[sortBy.value]) return 1
        if (a[sortBy.value] > b[sortBy.value]) return -1
      })
    })

    const showModal = ref(false)
    const handleModalShow = () => {
      const nextShowModal = (showModal.value = !showModal.value)
      showModal.value = nextShowModal
    }

    const handleUpdate = tweet => {
      tweet.likes += 1

      http
        .put(`/tweets/${tweet.id}.json`, tweet)
        .then(res => {})
        .catch(e => {
          console.log(e)
        })
    }

    return {
      data,
      sortBy,
      dataSortered,
      isLoading,
      showModal,
      handleModalShow,
      handleUpdate,
      compiledMarked,
      tweet,
      handleStore
    }
  }
}
</script>
