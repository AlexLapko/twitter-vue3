import axios from "axios"

export default axios.create({
  baseURL: 'https://vtwitter-52586-default-rtdb.europe-west1.firebasedatabase.app',
  header: {
    'Content-type': 'application/json'
  }
})