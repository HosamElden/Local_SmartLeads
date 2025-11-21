import { createContext, useContext, useState, ReactNode } from 'react'

interface InterestContextType {
  interests: string[]
  addInterest: (propertyId: string) => void
  removeInterest: (propertyId: string) => void
  isInterested: (propertyId: string) => boolean
  getInterests: () => string[]
}

const InterestContext = createContext<InterestContextType | undefined>(undefined)

export function InterestProvider({ children }: { children: ReactNode }) {
  const [interests, setInterests] = useState<string[]>([])

  const addInterest = (propertyId: string) => {
    if (!interests.includes(propertyId)) {
      setInterests(prev => [...prev, propertyId])
      console.log('Interest added for property:', propertyId)
    }
  }

  const removeInterest = (propertyId: string) => {
    setInterests(prev => prev.filter(id => id !== propertyId))
    console.log('Interest removed for property:', propertyId)
  }

  const isInterested = (propertyId: string): boolean => {
    return interests.includes(propertyId)
  }

  const getInterests = (): string[] => {
    return interests
  }

  return (
    <InterestContext.Provider
      value={{
        interests,
        addInterest,
        removeInterest,
        isInterested,
        getInterests
      }}
    >
      {children}
    </InterestContext.Provider>
  )
}

export function useInterest() {
  const context = useContext(InterestContext)
  if (context === undefined) {
    throw new Error('useInterest must be used within an InterestProvider')
  }
  return context
}
