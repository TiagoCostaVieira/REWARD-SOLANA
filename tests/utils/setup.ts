// tests/utils/setup.ts
import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { VaultProject } from "../../target/types/vault_project";

export const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

export const program = anchor.workspace.VaultProject as Program<VaultProject>;
export { BN };