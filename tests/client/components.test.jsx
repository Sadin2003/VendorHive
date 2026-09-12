import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Button from '../../src/components/ui/Button.jsx'
import Badge from '../../src/components/ui/Badge.jsx'

describe('Button', () => {
  it('renders a real button by default', () => {
    render(<Button>Save</Button>)
    const btn = screen.getByRole('button', { name: 'Save' })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveClass('btn', 'btn-primary')
  })

  it('applies variant and block classes', () => {
    render(<Button variant="outline" block>Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass('btn-outline', 'btn-block')
  })

  it('renders a router Link for to', () => {
    render(
      <MemoryRouter>
        <Button to="/explore">Explore</Button>
      </MemoryRouter>
    )
    const link = screen.getByRole('link', { name: 'Explore' })
    expect(link).toHaveAttribute('href', '/explore')
  })

  it('renders an anchor for href', () => {
    render(<Button href="mailto:x@y.co">Email</Button>)
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:x@y.co')
  })

  it('forwards onClick', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Press</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Press' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('respects the native type default', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('type', 'button')
  })
})

describe('Badge', () => {
  it('applies the tone class and children', () => {
    render(<Badge tone="amber">Pending</Badge>)
    const badge = screen.getByText('Pending')
    expect(badge).toHaveClass('badge', 'badge-amber')
  })

  it('defaults to green', () => {
    render(<Badge>Live</Badge>)
    expect(screen.getByText('Live')).toHaveClass('badge-green')
  })
})