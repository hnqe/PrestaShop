// Import utils
import testContext from '@utils/testContext';

// Import commonTests
import {createOrderByCustomerTest} from '@commonTests/FO/classic/order';

import {
  boDashboardPage,
  boLoginPage,
  boOrdersPage,
  type BrowserContext,
  dataCustomers,
  dataPaymentMethods,
  dataProducts,
  FakerOrder,
  type Page,
  utilsCore,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';

import {expect} from 'chai';

const baseContext = 'functional_BO_orders_orders_pagination';

/*
Pre-condition:
- Create 6 orders to have more than 10 orders
Scenario:
- Go to orders page
- Change items number par page to 10 and check number of pages
- Click on next and on previous
- Sort orders table by total desc
- Check the sort of the first page
- Click on next and check the sort of the second page
- Filter by customer name
- Check the filter on the first page
- Click on next and check the filter on the second page
 */
describe('BO - Orders : Pagination of orders table', async () => {
  let browserContext: BrowserContext;
  let page: Page;
  let numberOfOrders: number = 0;
  let sortedTable: string[] = [];
  let numberOfOrdersAfterFilter: number;

  const orderByCustomerData: FakerOrder = new FakerOrder({
    customer: dataCustomers.johnDoe,
    products: [
      {
        product: dataProducts.demo_1,
        quantity: 1,
      },
    ],
    paymentMethod: dataPaymentMethods.wirePayment,
  });

  // Pre-condition: Create 6 orders in FO
  const orderNumber: number = 6;

  for (let i = 1; i <= orderNumber; i++) {
    createOrderByCustomerTest(orderByCustomerData, `${baseContext}_preTest_${i}`);
  }

  // before and after functions
  before(async function () {
    browserContext = await utilsPlaywright.createBrowserContext(this.browser);
    page = await utilsPlaywright.newTab(browserContext);
  });

  after(async () => {
    await utilsPlaywright.closeBrowserContext(browserContext);
  });

  describe('Pagination next and previous', async () => {
    it('should login in BO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'loginBO', baseContext);

      await boLoginPage.goTo(page, global.BO.URL);
      await boLoginPage.successLogin(page, global.BO.EMAIL, global.BO.PASSWD);

      const pageTitle = await boDashboardPage.getPageTitle(page);
      expect(pageTitle).to.contains(boDashboardPage.pageTitle);
    });

    it('should go to \'Orders > Orders\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToOrdersPage', baseContext);

      await boDashboardPage.goToSubMenu(
        page,
        boDashboardPage.ordersParentLink,
        boDashboardPage.ordersLink,
      );

      const pageTitle = await boOrdersPage.getPageTitle(page);
      expect(pageTitle).to.contains(boOrdersPage.pageTitle);
    });

    it('should reset all filters and get number of orders', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFiltersFirst', baseContext);

      numberOfOrders = await boOrdersPage.resetAndGetNumberOfLines(page);
      expect(numberOfOrders).to.be.above(0);
    });

    it('should change the items number to 10 per page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeItemssNumberTo10', baseContext);

      const paginationNumber = await boOrdersPage.selectPaginationLimit(page, 10);
      expect(paginationNumber, `Number of pages is not correct (page 1 / ${Math.ceil(numberOfOrders / 10)})`)
        .to.contains(`(page 1 / ${Math.ceil(numberOfOrders / 10)})`);
    });

    it('should click on next', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnNext', baseContext);

      const paginationNumber = await boOrdersPage.paginationNext(page);
      expect(paginationNumber, `Number of pages is not (page 2 / ${Math.ceil(numberOfOrders / 10)})`)
        .to.contains(`(page 2 / ${Math.ceil(numberOfOrders / 10)})`);
    });

    it('should click on previous', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnPrevious', baseContext);

      const paginationNumber = await boOrdersPage.paginationPrevious(page);
      expect(paginationNumber, `Number of pages is not (page 1 / ${Math.ceil(numberOfOrders / 10)})`)
        .to.contains(`(page 1 / ${Math.ceil(numberOfOrders / 10)})`);
    });

    it('should change the items number to 50 per page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeItemsNumberTo50', baseContext);

      const paginationNumber = await boOrdersPage.selectPaginationLimit(page, 50);
      expect(paginationNumber, 'Number of pages is not correct').to.contains('(page 1 / 1)');
    });

    it('should sort orders by total desc', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'sortOrdersDesc', baseContext);

      const nonSortedTable = await boOrdersPage.getAllRowsColumnContent(page, 'total_paid_tax_incl');
      const nonSortedTableFloat: number[] = nonSortedTable.map((text: string): number => parseFloat(text));

      await boOrdersPage.sortTable(page, 'total_paid_tax_incl', 'desc');

      sortedTable = await boOrdersPage.getAllRowsColumnContent(page, 'total_paid_tax_incl');
      const sortedTableFloat: number[] = sortedTable.map((text: string): number => parseFloat(text));

      const expectedResult = await utilsCore.sortArrayNumber(nonSortedTableFloat);
      expect(sortedTableFloat).to.deep.equal(expectedResult.reverse());
    });

    it('should check that the orders table is sorted by total desc', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'CheckSortDesc', baseContext);

      const allOrdersTable = await boOrdersPage.getAllRowsColumnContent(page, 'total_paid_tax_incl');
      expect(allOrdersTable).to.deep.equal(sortedTable);
    });

    it('should change the items number to 10 per page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeItemsNumberTo10', baseContext);

      const paginationNumber = await boOrdersPage.selectPaginationLimit(page, 10);
      expect(paginationNumber, `Number of pages is not correct (page 1 / ${Math.ceil(numberOfOrders / 10)})`)
        .to.contains(`(page 1 / ${Math.ceil(numberOfOrders / 10)})`);
    });

    it('should check that the first page is sorted by total desc', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkFirstPageSortDesc', baseContext);

      const firstTable = await boOrdersPage.getAllRowsColumnContent(page, 'total_paid_tax_incl');
      expect(firstTable).to.deep.equal(sortedTable.slice(0, 10));
    });

    it('should click on next', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnNext2', baseContext);

      const paginationNumber = await boOrdersPage.paginationNext(page);
      expect(paginationNumber, `Number of pages is not (page 2 / ${Math.ceil(numberOfOrders / 10)})`)
        .to.contains(`(page 2 / ${Math.ceil(numberOfOrders / 10)})`);
    });

    it('should check that the second page is sorted by total desc', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkSecondPageSortDesc', baseContext);

      const secondTable = await boOrdersPage.getAllRowsColumnContent(page, 'total_paid_tax_incl');
      const numberOfOrdersInPage = await boOrdersPage.getNumberOfOrdersInPage(page);

      expect(secondTable).to.deep.equal(sortedTable.slice(10, 10 + numberOfOrdersInPage));
    });

    it('should change the items number to 50 per page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeItemsNumberTo50_2', baseContext);

      const paginationNumber = await boOrdersPage.selectPaginationLimit(page, 50);
      expect(paginationNumber, 'Number of pages is not correct').to.contains('(page 1 / 1)');
    });

    it('should go back to default sort', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goBackDefaultSort', baseContext);

      const nonSortedTable = await boOrdersPage.getAllRowsColumnContent(page, 'id_order');
      const nonSortedTableFloat: number[] = nonSortedTable.map((text: string): number => parseFloat(text));

      await boOrdersPage.sortTable(page, 'id_order', 'desc');

      sortedTable = await boOrdersPage.getAllRowsColumnContent(page, 'id_order');
      const sortedTableFloat: number[] = sortedTable.map((text: string): number => parseFloat(text));

      const expectedResult = await utilsCore.sortArrayNumber(nonSortedTableFloat);
      expect(sortedTableFloat).to.deep.equal(expectedResult.reverse());
    });

    it('should filter by customer \'J.DOE\'', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterByCustomer', baseContext);

      await boOrdersPage.filterOrders(page, 'input', 'customer', 'J. DOE');

      numberOfOrdersAfterFilter = await boOrdersPage.getNumberOfElementInGrid(page);
      expect(numberOfOrdersAfterFilter).to.be.at.most(numberOfOrders);
    });

    it('should check that the orders table is filtered by customer', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'CheckFilterByCustomer', baseContext);

      for (let row = 1; row <= numberOfOrdersAfterFilter; row++) {
        const textColumn = await boOrdersPage.getTextColumn(page, 'customer', row);
        expect(textColumn).to.equal('J. DOE');
      }
    });

    it('should change the items number to 10 per page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeItemsNumberTo10AfterFilter', baseContext);

      const paginationNumber = await boOrdersPage.selectPaginationLimit(page, 10);
      expect(paginationNumber, `Number of pages is not correct (page 1 / ${Math.ceil(numberOfOrders / 10)})`)
        .to.contains(`(page 1 / ${Math.ceil(numberOfOrders / 10)})`);
    });

    it('should check that the first page is filtered by Customer \'J.DOE\'', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkFilterInFirstPage', baseContext);

      for (let row = 1; row <= 10; row++) {
        const textColumn = await boOrdersPage.getTextColumn(page, 'customer', row);
        expect(textColumn).to.equal('J. DOE');
      }
    });

    it('should click on next', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnNext3', baseContext);

      const paginationNumber = await boOrdersPage.paginationNext(page);
      expect(paginationNumber, `Number of pages is not (page 2 / ${Math.ceil(numberOfOrders / 10)})`)
        .to.contains(`(page 2 / ${Math.ceil(numberOfOrders / 10)})`);
    });

    it('should check that the second page is filtered by Customer \'J.DOE\'', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkFilterInSecondPage', baseContext);

      const numberOfOrdersInPage = await boOrdersPage.getNumberOfOrdersInPage(page);

      for (let row = 1; row <= numberOfOrdersInPage; row++) {
        const textColumn = await boOrdersPage.getTextColumn(page, 'customer', row);
        expect(textColumn).to.equal('J. DOE');
      }
    });

    it('should reset all filters', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFilter', baseContext);

      const numberOfOrdersAfterReset = await boOrdersPage.resetAndGetNumberOfLines(page);
      expect(numberOfOrdersAfterReset).to.be.equal(numberOfOrders);
    });
  });
});
