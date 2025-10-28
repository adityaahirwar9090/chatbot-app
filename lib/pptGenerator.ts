import { generateEditResponse } from './geminiClient'

export interface SlideData {
  title: string
  content: string[]
  type: 'title' | 'content' | 'bullet' | 'image'
}

export interface PPTData {
  title: string
  slides: SlideData[]
}

// Simple PPT object for demo purposes
export interface SimplePPT {
  title: string
  slides: SlideData[]
  download: () => void
}

export async function generatePPT(data: PPTData): Promise<SimplePPT> {
  return new Promise((resolve) => {
    // Simulate PPT generation
    const ppt = {
      title: data.title,
      slides: data.slides,
      download: () => {
        // Create a simple text file as demo
        const content = `Presentation: ${data.title}\n\n` +
          data.slides.map((slide, index) => 
            `Slide ${index + 1}: ${slide.title}\n${slide.content.join('\n')}\n`
          ).join('\n')
        
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${data.title}.txt`
        a.click()
        URL.revokeObjectURL(url)
      }
    }
    
    // Simulate async operation
    setTimeout(() => resolve(ppt), 1000)
  })
}

export async function editPPT(
  currentPPT: SimplePPT,
  editPrompt: string,
  messageHistory: any[]
): Promise<SimplePPT> {
  try {
    // Extract current PPT data structure
    const currentData = {
      title: currentPPT.title,
      slides: currentPPT.slides
    }
    
    // Generate edit response using AI
    const editResponse = await generateEditResponse(editPrompt, currentData, messageHistory)
    
    if (editResponse.pptData) {
      // Generate new PPT with edited data
      return await generatePPT(editResponse.pptData)
    }
    
    return currentPPT
  } catch (error) {
    console.error('Error editing PPT:', error)
    throw error
  }
}

function extractPPTData(ppt: SimplePPT): PPTData {
  return {
    title: ppt.title,
    slides: ppt.slides
  }
}

export function downloadPPT(ppt: SimplePPT, filename: string = 'presentation.txt') {
  ppt.download()
}

export function downloadAsPDF(ppt: SimplePPT, filename: string = 'presentation.pdf') {
  // For now, download as text file
  ppt.download()
}
