import dayjs from 'dayjs'
import { db } from '../db'
import { goalCompletions } from '../db/schema'
import { and, gte, lte,count } from 'drizzle-orm'

interface CreateGoalCompletionRequest {
  goalId: string
}
export async function createGoalCompletion({
  goalId
}: CreateGoalCompletionRequest) {
    const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

    const goalCompletionsCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id)
          .as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const result = await db
    .insert(goalCompletions)
    .values({
      goalId
    })
    .returning()
  const goal = result[0]

  return {
    goalCompletions,
  }
}
