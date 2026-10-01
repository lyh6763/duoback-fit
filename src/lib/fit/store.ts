import { createStorageStore } from "@/lib/storage";
import { draftSchema, profileSchema } from "./profile";

/** 마지막 Fit 결과. 브라우저에만 저장하고 서버로 보내지 않는다. */
export const profileStore = createStorageStore("duoback-fit:profile", "local", profileSchema);

/** 진행 중인 답변. 탭을 닫으면 사라진다. */
export const draftStore = createStorageStore("duoback-fit:draft", "session", draftSchema);
