/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen } from "@testing-library/dom";
import { fireEvent } from "@testing-library/dom";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import ErrorPage from "../views/ErrorPage.js";

jest.mock("../app/store", () => mockStore);


beforeAll(() => {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "employee@test.tld",
      status: "connected",
    })
  );
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  window.onNavigate(ROUTES_PATH.NewBill);
});
afterEach(() => {
  jest.clearAllMocks()
 })

  describe("When I am on NewBill Page", () => {
    describe('When i whant edit a new bill', () => {

      test("Then i add a type", () => {
        const typeBill = screen.getByTestId("expense-type");
        fireEvent.change(typeBill, { target: { value: "Transports" } });
        expect(typeBill.value).toBe("Transports");
      })
  
      test("Then i add a name", () => {
        const nameBill = screen.getByTestId("expense-name");
        fireEvent.change(nameBill, { target: { value: "vol paris lyon" } });
        expect(nameBill.value).toBe("vol paris lyon");
      })
  
      test("Then i add a date", () => {
        const dateBill = screen.getByTestId("datepicker");
        fireEvent.change(dateBill, { target: { value: "2020-05-24" } });
        expect(dateBill.value).toBe("2020-05-24");
      })
  
      test("Then i add a price", () => {
        const amountBill = screen.getByTestId("amount");
        fireEvent.change(amountBill, { target: { value: "200" } });
        expect(amountBill.value).toBe("200");
      })
  
      test("Then i add a tva", () => {
        const tvaBill = screen.getByTestId("vat");
        fireEvent.change(tvaBill, { target: { value: "20" } });
        expect(tvaBill.value).toBe("20");
      })
  
      test("Then i add a pct", () => {
        const pctBill = screen.getByTestId("pct");
        fireEvent.change(pctBill, { target: { value: "20" } });
        expect(pctBill.value).toBe("20");
      })
  
      test("Then i add a comment.", () => {
        const commentaryBill = screen.getByTestId("commentary");
        fireEvent.change(commentaryBill, {
          target: { value: "Ceci est un commentaire" },
        });
        expect(commentaryBill.value).toBe("Ceci est un commentaire");
      })
      
      test('Then i upload a picture with a incorrect format' , () => {
        const fileBill = screen.getByTestId("file");
        const fakeFile = new File(["hello"], "hello.gif", { type: "image/gif" });
        const formatedBills = jest.spyOn(mockStore.bills(), "create")
        userEvent.upload(fileBill, fakeFile)
        expect(formatedBills).not.toHaveBeenCalled()
       })

       test('Then i upload a picture' , () => {
        const fileBill = screen.getByTestId("file");
        const fakeFile = new File(["hello"], "hello.png", { type: "image/png" });
        const formatedBills = jest.spyOn(mockStore.bills(), "create")
        userEvent.upload(fileBill, fakeFile)
        expect(formatedBills).toHaveBeenCalled()
        expect(fileBill.files[0]).toStrictEqual(fakeFile)
        expect(fileBill.files.item(0)).toStrictEqual(fakeFile)
        expect(fileBill.files).toHaveLength(1)
       })
    })
    
    describe('When i whant send a new bill', () => {
      test('Then a send new bill' , () => {
        const formatedBills = jest.spyOn(mockStore.bills(), "update")
        const form = screen.getByTestId("form-new-bill");
        fireEvent.submit(form);
        expect(formatedBills).toHaveBeenCalled();
       })
    })

    describe("when an error occurs when you want to add a new bill ", () => {
      test("fetches bills from an API and fails with 404  error", () => {
        mockStore.bills(() => {
          return {
            update : () =>  {
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
            update : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
        const html = ErrorPage("Erreur 500")
        document.body.innerHTML = html
        
        const message = screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  });



