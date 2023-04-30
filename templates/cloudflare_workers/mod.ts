import cheetah, { Collection } from 'cheetah'
import zod, { z } from 'zod'

const fastFood = new Collection<typeof zod>()
  .get('/burger', () => '🍔')
  .get('/fries', () => '🍟')
  .get('/taco', () => '🌮')
  .get('/pizza', () => '🍕')

const app = new cheetah({
  validator: zod
})
  .use('/fast-food', fastFood)

  .get('/cookie', () => '🍪')

  .get('/pet', {
    query: z.object({
      pet: z.literal('cat')
        .or(z.literal('dog'))
        .or(z.literal('parrot'))
        .or(z.literal('rabbit'))
    })
  }, c => {
    return c.req.query.pet === 'cat'
      ? '🐈'
      : c.req.query.pet === 'dog'
      ? '🐕'
      : c.req.query.pet === 'parrot'
      ? '🦜'
      : '🐇'
  })

export default app
