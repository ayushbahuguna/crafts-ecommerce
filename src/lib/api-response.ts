import { NextResponse } from 'next/server'

export function createResponse(data: unknown, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function createValidationErrorResponse(errors: Record<string, string>) {
  return NextResponse.json(
    { success: false, error: 'Validation failed', errors },
    { status: 400 }
  )
}
