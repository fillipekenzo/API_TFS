/**
 * Funções de criptografia simples para senhas
 * Usa base64 com uma chave de criptografia para ofuscar a senha
 */

const ENCRYPTION_KEY = "TFS_API_ENCRYPTION_KEY_2026";
const KEY_SEPARATOR = "|||KEY_SEPARATOR|||";

/**
 * Criptografa uma string usando base64 e uma chave
 */
export function encryptPassword(password: string): string {
  try {
    // Cria uma string combinando a senha com a chave usando um separador
    const combined = password + KEY_SEPARATOR + ENCRYPTION_KEY;
    // Converte para base64
    const encoded = btoa(combined);
    // Inverte a string para adicionar uma camada extra
    return encoded.split('').reverse().join('');
  } catch (error) {
    console.error("Erro ao criptografar senha:", error);
    return password; // Retorna a senha original em caso de erro
  }
}

/**
 * Descriptografa uma string criptografada
 */
export function decryptPassword(encryptedPassword: string): string {
  try {
    // Reverte a inversão
    const reversed = encryptedPassword.split('').reverse().join('');
    // Decodifica do base64
    const decoded = atob(reversed);
    // Remove a chave usando o separador para obter a senha original
    const password = decoded.split(KEY_SEPARATOR)[0];
    return password;
  } catch (error) {
    console.error("Erro ao descriptografar senha:", error);
    return encryptedPassword; // Retorna a string original em caso de erro
  }
}
