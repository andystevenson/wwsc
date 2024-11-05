import { Params } from './Types'
import { GET } from './GET'
export const getAttachments = async (code: string, params: Params) => {
  const getAttachmentsData = GET<any>('attachments', code, params)
  const attachments = await getAttachmentsData()
  return attachments.$items
}
