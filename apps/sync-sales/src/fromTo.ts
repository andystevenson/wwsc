import { parseArgs, chalk } from '@wwsc/lib-cli'
import { dayjs, tomorrowUK, todayUK, lastOctoberUK } from '@wwsc/lib-dates'
import * as packageJson from '../package.json'

export const fromTo = () => {
  const args = parseArgs(process.argv.slice(2), {
    string: ['from', 'to'],
    boolean: [
      'help',
      'day',
      'week',
      'month',
      'year',
      'financial',
      'version',
      'v',
    ],
  })

  let { from, to, help, day, week, month, year, financial, version, v } = args

  if (version || v) {
    console.log(packageJson.version)
    process.exit()
  }

  if (help) {
    console.log(`${chalk.whiteBright.bold('sync-sales\n')}`)
    console.log(`${chalk.whiteBright.bold('VERSION')}`)
    console.log(`  ${packageJson.version}\n`)
    console.log(`${chalk.whiteBright.bold('USAGE')}`)
    console.log(`  sync-sales [options]\n`)
    console.log(`${chalk.whiteBright.bold('OPTIONS')}`)
    console.log(
      `  --help            ${chalk.blueBright(': show this help page')}`,
    )
    console.log(
      `  --version | -v    ${chalk.blueBright(`: show version ${chalk.whiteBright(`${packageJson.version}`)}`)}`,
    )
    console.log(
      `  --from YYYY-MM-DD ${chalk.blueBright(': date from which to start syncing sales - default is start of current day')}`,
    )
    console.log(
      `  --to   YYYY-MM-DD ${chalk.blueBright(`: end date - default is date following '--from' date`)}`,
    )
    console.log(
      `  --day             ${chalk.blueBright(': sync sales for a single day')}`,
    )
    console.log(
      `  --week            ${chalk.blueBright(': sync sales for a week')}`,
    )
    console.log(
      `  --month           ${chalk.blueBright(': sync sales for a month')}`,
    )
    console.log(
      `  --year            ${chalk.blueBright(': sync sales for a year')}`,
    )
    console.log(
      `  --financial       ${chalk.blueBright(': sync sales for a financial year')}\n`,
    )

    process.exit()
  }

  const period = financial
    ? 'year'
    : year
      ? 'year'
      : month
        ? 'month'
        : week
          ? 'week'
          : day
            ? 'day'
            : 'day'

  const format = 'YYYY-MM-DD'

  if (from) {
    from = dayjs(from, format, true)
    if (!from.isValid()) {
      console.error(`invalid 'from' date, should be in format ${format}`)
      process.exit(1)
    }
  } else {
    from = dayjs().startOf(period)
    // special case for financial year
    if (financial) {
      from = lastOctoberUK
    }

    if (week) {
      // dayjs week starts on Sunday
      if (todayUK.day() === 0) {
        from = todayUK.subtract(1, 'week').add(1, 'day')
      }

      if (todayUK.day() > 0) {
        from = todayUK.startOf('week').add(1, 'day')
      }
    }
  }

  if (from.isAfter(todayUK)) {
    console.error(`error 'from' date is in the future`)
    process.exit(1)
  }

  if (to) {
    to = dayjs(to, format, true)
    if (!to.isValid()) {
      console.error(`invalid 'to' date, should be in format ${format}`)
      process.exit(1)
    }
  } else {
    to = from.add(1, period)
  }

  if (to.isBefore(from)) {
    console.error(`error 'to' date is before 'from' date`)
    process.exit(1)
  }

  if (to.isAfter(tomorrowUK)) {
    to = tomorrowUK
  }

  console.log(from.format(), to.format(), 'fromTo')
  return { from, to }
}
