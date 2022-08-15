const STAMPCOIN = '9nDWI3eHrMQbrfs9j8_YPfLbYJmBodgn7cBCG8bii4o'

export const getCount = async (txId) => {
  return await fetch('https://stamp-cache.onrender.com')
    .then(res => res.json())
    //.catch(_ => 'N/A')
    .then(state => Object.values(state.stamps).filter(s => s.asset === txId))
    .then(stamps => stamps.length)

  //return Promise.resolve(0)
}