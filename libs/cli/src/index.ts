import { SingleBar, Presets, type Options, type Params } from 'cli-progress'
import { oraPromise as spinner } from 'ora'
import chalk from 'chalk'
import parseArgs from 'minimist'

export const Formatter = (options: Options, params: Params, payload: any) => {
  let { barCompleteChar, barIncompleteChar } = options

  const { value, total, progress } = params

  const barsize = options.barsize || 40
  const completeChar = barCompleteChar || '\u2588'
  const incompleteChar = barIncompleteChar || '\u2591'
  const completeLength = Math.round(barsize * progress)
  const incompleteLength = Math.round(barsize * (1 - progress))

  const bar =
    completeChar.repeat(completeLength) +
    incompleteChar.repeat(incompleteLength)

  const percentage = Math.round(progress * 100)
  const duration = Math.round(Date.now() / 1000 - params.startTime / 1000)

  const { transaction_code } = payload

  const title = chalk.bold.white('summaries')

  const template = {
    start:
      `${title} ` +
      `| ${chalk.bold.red(bar)} ` +
      `| ${chalk.white(`${duration}`)}s ` +
      `| ${chalk.white(`${percentage}%`)} ` +
      `| ${chalk.bold.red(value)}` +
      `/${chalk.greenBright(`${total} transactions`)} ` +
      `| ${chalk.bold.white(transaction_code)}`,
    at70percent:
      `${title} ` +
      `| ${chalk.yellow(bar)} ` +
      `| ${chalk.white(`${duration}`)}s ` +
      `| ${chalk.white(`${percentage}%`)} ` +
      `| ${chalk.yellow(value)}` +
      `/${chalk.greenBright(`${total} transactions`)} ` +
      `| ${chalk.bold.white(transaction_code)}`,
    end:
      `${title} ` +
      `| ${chalk.greenBright(bar)} ` +
      `| ${chalk.greenBright(`${duration}`)}s ` +
      `| ${chalk.greenBright(`${percentage}%`)} ` +
      `| ${chalk.greenBright(value)}` +
      `/${chalk.greenBright(`${total} transactions`)} ` +
      `| ${chalk.bold.white(transaction_code)}`,
  }

  if (percentage === 100) return template.end
  if (percentage < 70) return template.start
  if (percentage >= 70) return template.at70percent
  return ''
}

export const ProgressBar = () =>
  new SingleBar(
    {
      format: Formatter,
      barsize: 40,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    },
    Presets.shades_classic,
  )

export { spinner, parseArgs, chalk }
