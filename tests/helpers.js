import { fireEvent, within } from '@testing-library/react'

export const refreshProductsList = container => {
  const { getByText } = within(container)
  fireEvent.click(getByText('refresh products list'))
}

export const getTableRowsText = container => {
  const { getAllByRole } = within(container)
  return getAllByRole('row').map(row => row.textContent)
}