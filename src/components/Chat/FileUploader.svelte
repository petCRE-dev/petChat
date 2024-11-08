<script lang="ts">
  import type { DifyFileResponse } from "../../types/types";
  
  export let onFileUploaded: (file: DifyFileResponse) => void;
  export let disabled: boolean = false;
  
  let uploading = false;
  let error: string | null = null;

  async function handleFileChange(event: Event) {

    alert("Noch nicht implementiert")
    return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      return;
    }

    error = null;
    uploading = true;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user", "abc-123");

      const response = await fetch("/api/file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Upload failed');
      }

      const data: DifyFileResponse = await response.json();
      onFileUploaded(data);
      
    } catch (err) {
      error = err instanceof Error ? err.message : 'Upload failed';
      console.error('File upload error:', err);
    } finally {
      uploading = false;
      // Reset input
      (event.target as HTMLInputElement).value = '';
    }
  }
</script>

<div class="file-upload">
  <label for="file-input" class="upload-label" class:disabled>
    {#if uploading}
      <span class="loading">Uploading...</span>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="upload-icon">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
      </svg>
    {/if}
  </label>
  <!-- <input
  type="file"
  id="file-input"
  accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
  on:change={handleFileChange}
  disabled={disabled || uploading}
  class="hidden"
/> -->
  {#if error}
    <div class="error-message">
      {error}
    </div>
  {/if}
</div>

<style>
  .file-upload {
    position: relative;
    display: inline-block;
  }

  .upload-label {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .upload-label:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .upload-label.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .hidden {
    display: none;
  }

  .upload-icon {
    fill: currentColor;
  }

  .loading {
    font-size: 14px;
    color: #666;
  }

  .error-message {
    color: #dc2626;
    font-size: 14px;
    margin-top: 4px;
  }
</style>
