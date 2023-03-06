/* @jest-environment jsdom
 */

import '@testing-library/jest-dom/extend-expect'
import {screen, waitFor, getAllByTestId, getByTestId} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import { ROUTES } from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import ErrorPage from "../views/ErrorPage.js";


jest.mock("../app/store", () => mockStore)

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
       "type": "Employee",
       "email": "employee@test.tld",
       "status": "connected"
      }))
  const root = document.createElement("div")
  root.setAttribute("id", "root")
  document.body.append(root)
  router()
  window.onNavigate(ROUTES_PATH.Bills)
})

afterEach(() => {
 jest.clearAllMocks()
})

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon')
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
 
  describe("When I click on the icon eye", () => {
    test("Then a modal should open", async () => {
      $.fn.modal = jest.fn(); 
      new Bills({ document, onNavigate, store: mockStore, localStorage })
      const eyeIcons = getAllByTestId(document.body, "icon-eye")
      const firstEyeIcons = eyeIcons[0]
      
      userEvent.click(firstEyeIcons)
      
      expect($.fn.modal).toHaveBeenCalled()
    })
  })

  describe("when I'm on the home page ", () => {
    test("Then all the bills are displayed", async () => {
     const formatedBills = jest.spyOn(mockStore.bills(), "list")
     const bills = new Bills({ document, onNavigate, store: mockStore, localStorage })
     await bills.getBills() 
     expect(formatedBills).toHaveBeenCalled()
    })
  })
  
  describe("when I whant edit a new bill ", () => {
    test("Then the button for edit the bill is visible", async () => {
     const button = getByTestId(document.body, 'btn-new-bill')
     expect(button).toBeVisible();
    })
    
    test('Then I click on this page button to open the edit bill', async () => {
      const button = getByTestId(document.body, 'btn-new-bill')
      const myMockFunction = jest.fn();
      button.addEventListener('click', myMockFunction)
      userEvent.click(button)
      expect(myMockFunction).toHaveBeenCalled()
    })
  })

  
  describe("when an error occurs when you want to display every bills", () => {
    test("fetches bills from an API and fails with 404 message error", () => {
      mockStore.bills(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      const html = ErrorPage("Erreur 404")
      document.body.innerHTML = html
      
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches bills from an API and fails with 500 message error", () => {
      mockStore.bills(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      const html = ErrorPage("Erreur 500")
      document.body.innerHTML = html
      
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
}) 

