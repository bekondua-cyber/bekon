export interface PortfolioOption {
  id: string
  title: string
}

export interface CharacterOption {
  id: string
  name: string
  gender: string | null
  age: number | null
  photoUrl: string
}

export interface MaterialOption {
  id: string
  label: string
  photoUrl: string
}

export interface GeneratedResult {
  id: string
  title: string
  resultJson: string
}

export type StepNumber = 1 | 2 | 3 | 4
