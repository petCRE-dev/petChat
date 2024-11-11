/* export type DifyResponse = {
	fileinput?:{
		file?:any|null;
		filename?:string;
		thumbnail?:string;
	};
  role?: string;
  event?: string;
  task_id?: string;
  id?: string;
  message_id?: string;
  conversation_id?: string;
  mode?: string;
  answer?: string;
  metadata: {
    usage?: {
      prompt_tokens: number;
      prompt_unit_price: string;
      prompt_price_unit: string;
      prompt_price: string;
      completion_tokens: number;
      completion_unit_price: string;
      completion_price_unit: string;
      completion_price: string;
      total_tokens: number;
      total_price: string;
      currency: string;
      latency: number;
    };
    retriever_resources?: Array<{
      dataset_id: string;
      dataset_name: string;
      document_id: string;
      document_name: string;
      data_source_type: string;
      segment_id: string;
      retriever_from: string;
      score: number;
      content: string;
      position: number;
    }>;
  };
  created_at?: number;
};

export type DifyFileResponse = {
	thumbnailUrl?:string;
  id: string;
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  created_by: string;
  created_at: number;
};
 */
export interface DifyResponse {
  answer: string;
  conversation_id?: string;
  role: "user" | "assistant";
  metadata: {
    retriever_resources?: any[];
  };
  fileinput?: {
    file: File | null;
    filename: string;
    thumbnail?: string;
  };
}
export interface DifyFileResponse {
  id: string;
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  created_by: string;
  created_at: number;
  thumbnailUrl?: string;
}


export interface UserInfo{
  displayName:string;
  givenName:string;
  id:string;
  preferredLanguage:string;


}