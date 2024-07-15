export interface WishRequest {
  wishes: string;
  from: string;
  to: string;
}

export interface Wish extends WishRequest {
  computation_started_at: any;
  hash: string | undefined;
  pow_nonce: number | undefined;
  computation_finished_at: any;
  uuid: string;
  done_by_worker_id?: string;
}

export interface WishDBRecord {
  uuid: string;
  body: string;
  request_received_at: string;
  computation_started_at?: string;
  computation_finished_at?: string;
  pow_nonce?: number;
  hash?: string;
  done_by_worker_id?: string;
}

export interface WorkerResult {
  pow_nonce: number;
  hash: string;
}

export type WishStatus = "not_found" | "queued" | "in_progress" | "completed";
