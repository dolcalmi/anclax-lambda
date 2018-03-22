import apex from 'apex.js'

export default apex(e => {
  console.log('processing event: %j', e)
  return { hello: 'world' }
})
