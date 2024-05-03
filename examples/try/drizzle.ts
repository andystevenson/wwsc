import {
  insertUser,
  getUserWithPosts,
  deleteUser,
} from './src/functions/user.js'
import { insertPost, patchPost } from './src/functions/post.js'
import { faker } from '@faker-js/faker'

const Users = [
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
  },
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
  },
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
  },
]

const someUser = async () => {
  for (const user of Users) {
    console.log('Inserting user:', user)
    await insertUser(user)
  }
}

// await someUser()

const getUsers = async () => {
  let user = await getUserWithPosts(1)
  console.log('User:', user)
  user = await getUserWithPosts(2)
  console.log('User:', user)
  user = await getUserWithPosts(3)
  console.log('User:', user)
}

const Posts = [
  {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    userId: 1,
  },
  {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    userId: 1,
  },
  {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    userId: 2,
  },
]

const somePost = async () => {
  for (const post of Posts) {
    console.log('Inserting post:', post)
    await insertPost(post)
  }
}

const deleteUsers = async () => {
  // await deleteUser(1)
  // await deleteUser(2)
  await deleteUser(3)
}

const updatePost = async (id: number) => {
  await patchPost(id, { title: 'Updated title', content: 'Updated content' })
}

// await somePost()
await updatePost(9)
await getUsers()
// await deleteUsers()
