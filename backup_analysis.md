# Backup Analysis

## Table: User
- **Record Count**: 9
- **Schema Fields**:
  - `id`: string (e.g. "cmqlpv5mp000yuecs3483bylp")
  - `email`: string (e.g. "testuser@demo.com")
  - `emailVerified`: object (e.g. null)
  - `name`: string (e.g. "Test")
  - `image`: object (e.g. null)
  - `passwordHash`: string (e.g. "scrypt:16384:8:1:a9c2e6e9b338)
  - `role`: string (e.g. "VIEWER")
  - `permissions`: object (e.g. [])
  - `active`: boolean (e.g. true)
  - `createdAt`: string (e.g. "2026-06-20T02:06:24.576Z")
  - `updatedAt`: string (e.g. "2026-06-20T02:06:24.576Z")

## Table: Account
- **Record Count**: 0

## Table: Session
- **Record Count**: 0

## Table: VerificationToken
- **Record Count**: 0

## Table: Shop
- **Record Count**: 2
- **Schema Fields**:
  - `id`: string (e.g. "cmq7kgo6x0000l504t8gkk8yp")
  - `name`: string (e.g. "SHEBA TECHNOLOGY AND NETWORKI)
  - `slug`: string (e.g. "onlinetaiba")
  - `logoUrl`: string (e.g. "https://res.cloudinary.com/da)
  - `currency`: string (e.g. "BDT")
  - `timezone`: string (e.g. "Asia/Dhaka")
  - `settings`: object (e.g. {"email":"shebatechbd001@gmail)
  - `createdAt`: string (e.g. "2026-06-10T04:26:24.249Z")
  - `updatedAt`: string (e.g. "2026-08-03T19:46:22.055Z")

## Table: Warehouse
- **Record Count**: 1
- **Schema Fields**:
  - `id`: string (e.g. "seed-wh-hq")
  - `name`: string (e.g. "HQ Warehouse")
  - `code`: string (e.g. "HQ")
  - `isActive`: boolean (e.g. true)
  - `createdAt`: string (e.g. "2026-06-20T01:43:05.238Z")

## Table: Category
- **Record Count**: 30
- **Schema Fields**:
  - `id`: string (e.g. "cmqcib2s4000dl104vy0zyndh")
  - `name`: string (e.g. "Wall Mounts")
  - `slug`: string (e.g. "wall-mounts")
  - `imageUrl`: object (e.g. null)
  - `parentId`: string (e.g. "cmqcg03kx0001js04h12zhi79")
  - `isPublished`: boolean (e.g. false)
  - `showInMenu`: boolean (e.g. true)
  - `menuOrder`: number (e.g. 0)
  - `deletedAt`: object (e.g. null)
  - `createdAt`: string (e.g. "2026-06-13T15:24:54.869Z")
  - `updatedAt`: string (e.g. "2026-06-13T15:26:28.561Z")

## Table: Brand
- **Record Count**: 38
- **Schema Fields**:
  - `id`: string (e.g. "cmr6joqt70000uevkn6xwy11z")
  - `name`: string (e.g. "Non-Brand")
  - `isPublished`: boolean (e.g. false)
  - `createdAt`: string (e.g. "2026-07-04T15:56:37.435Z")

## Table: ProductType
- **Record Count**: 34
- **Schema Fields**:
  - `id`: string (e.g. "cmr6jppf3000ruevkn54h15qr")
  - `name`: string (e.g. "Cables & Connectivity")
  - `isPublished`: boolean (e.g. false)
  - `createdAt`: string (e.g. "2026-07-04T15:57:21.913Z")

## Table: Model
- **Record Count**: 112
- **Schema Fields**:
  - `id`: string (e.g. "cmr6jqbys001auevk1jax61ps")
  - `name`: string (e.g. "CS-X5S")
  - `isPublished`: boolean (e.g. false)
  - `createdAt`: string (e.g. "2026-07-04T15:57:51.508Z")

## Table: Series
- **Record Count**: 52
- **Schema Fields**:
  - `id`: string (e.g. "cmr6jsdt10031uevk66ptgubj")
  - `name`: string (e.g. "Black")
  - `isPublished`: boolean (e.g. false)
  - `createdAt`: string (e.g. "2026-07-04T15:59:27.206Z")

## Table: Color
- **Record Count**: 0

## Table: Storage
- **Record Count**: 0

## Table: Ram
- **Record Count**: 0

## Table: BrandSubcategory
- **Record Count**: 0

## Table: ProductTypeBrand
- **Record Count**: 0

## Table: ModelProductType
- **Record Count**: 0

## Table: SeriesModel
- **Record Count**: 0

## Table: ItemList
- **Record Count**: 0

## Table: Product
- **Record Count**: 122
- **Schema Fields**:
  - `id`: string (e.g. "cmqrr2xp30003l104qxuijd0i")
  - `sku`: string (e.g. "SKU-01459")
  - `barcode`: string (e.g. "2002294527186")
  - `name`: string (e.g. "Smart Pan-Tilt Camera")
  - `slug`: string (e.g. "smart-pan-tilt-camera")
  - `description`: object (e.g. null)
  - `shortDescription`: object (e.g. null)
  - `categoryId`: string (e.g. "cmqcbcj7z0001jm04c7osax99")
  - `price`: string (e.g. "5800")
  - `onlinePrice`: object (e.g. null)
  - `compareAtPrice`: object (e.g. null)
  - `cost`: string (e.g. "5050")
  - `stock`: number (e.g. 2)
  - `reorderLevel`: number (e.g. 5)
  - `unit`: string (e.g. "pcs")
  - `bundleQty`: object (e.g. null)
  - `subcategory`: string (e.g. "Portable WiFi Camera")
  - `globalBrandId`: string (e.g. "cmr6joxx70006uevkyc3jt06e")
  - `productTypeId`: string (e.g. "cmr6jq1xj0012uevksapw71le")
  - `globalModelId`: string (e.g. "cmr6jqqy9001muevkb81y0l9b")
  - `globalSeriesId`: string (e.g. "cmr6jsqv6003cuevkxiurdaji")
  - `color`: object (e.g. null)
  - `storage`: object (e.g. null)
  - `ram`: object (e.g. null)
  - `condition`: string (e.g. "New")
  - `emoji`: string (e.g. "📦")
  - `wholesalePrice`: string (e.g. "0")
  - `supplierId`: object (e.g. null)
  - `trackSerials`: boolean (e.g. true)
  - `warrantyStartDate`: string (e.g. "2026-06-22T00:00:00.000Z")
  - `warrantyMonths`: number (e.g. 11)
  - `searchTags`: object (e.g. [])
  - `isService`: boolean (e.g. false)
  - `isPublished`: boolean (e.g. true)
  - `isTrending`: boolean (e.g. false)
  - `isFlashDeal`: boolean (e.g. false)
  - `deletedAt`: object (e.g. null)
  - `createdAt`: string (e.g. "2026-06-24T07:27:04.215Z")
  - `updatedAt`: string (e.g. "2026-07-18T07:12:14.154Z")

## Table: ProductImage
- **Record Count**: 95
- **Schema Fields**:
  - `id`: string (e.g. "cmqdpqbjs0004lg0448zxd580")
  - `productId`: string (e.g. "cmqcknmw00001l804tro2q59l")
  - `url`: string (e.g. "https://res.cloudinary.com/da)
  - `publicId`: string (e.g. "Screenshot_from_2026-06-14_17)
  - `position`: number (e.g. 0)
  - `alt`: object (e.g. null)

## Table: ProductVariant
- **Record Count**: 0

## Table: WarehouseStock
- **Record Count**: 95
- **Schema Fields**:
  - `id`: string (e.g. "cmr8r9qf00014kz04ll2oytww")
  - `warehouseId`: string (e.g. "seed-wh-hq")
  - `productId`: string (e.g. "cmqcq1cxl0003l204hxny2afi")
  - `qty`: number (e.g. 2)

## Table: Customer
- **Record Count**: 51
- **Schema Fields**:
  - `id`: string (e.g. "cmscomqkr001jla04b62wefe2")
  - `name`: string (e.g. "Jahid Mia")
  - `phone`: string (e.g. "0125125425455")
  - `email`: object (e.g. null)
  - `address`: string (e.g. "Sabji Bazar")
  - `due`: string (e.g. "0")
  - `balance`: string (e.g. "0")
  - `creditLimit`: string (e.g. "0")
  - `totalSpent`: string (e.g. "7500")
  - `loyaltyPoints`: number (e.g. 75)
  - `group`: string (e.g. "Regular")
  - `referencePerson`: object (e.g. null)
  - `notes`: object (e.g. null)
  - `deletedAt`: object (e.g. null)
  - `createdAt`: string (e.g. "2026-08-03T03:41:21.081Z")

## Table: CustomerTransaction
- **Record Count**: 232
- **Schema Fields**:
  - `id`: string (e.g. "cmr8xilwa0001k0047nmo5x0x")
  - `customerId`: string (e.g. "cmr31upw70000l4042gu67zkn")
  - `type`: string (e.g. "ADJUSTMENT")
  - `amount`: string (e.g. "20000")
  - `balanceBefore`: string (e.g. "30000")
  - `balanceAfter`: string (e.g. "50000")
  - `saleId`: object (e.g. null)
  - `accountId`: string (e.g. "cmqcc2tnb0004l704ynjmwukt")
  - `reference`: object (e.g. null)
  - `notes`: string (e.g. "Advance deposit: 20000")
  - `createdById`: string (e.g. "cmq7kgoml0002l504yg2n1dza")
  - `createdAt`: string (e.g. "2026-07-06T07:59:18.106Z")

## Table: Supplier
- **Record Count**: 10
- **Schema Fields**:
  - `id`: string (e.g. "cmqclnt3v0002l504l2da0k6x")
  - `name`: string (e.g. "Nesma Information Technology )
  - `contactPerson`: string (e.g. "Rakib Hossain")
  - `phone`: string (e.g. "01968440905")
  - `email`: object (e.g. null)
  - `address`: string (e.g. "Elephant Road, Dhaka")
  - `notes`: object (e.g. null)
  - `payable`: string (e.g. "0")
  - `advanceBalance`: string (e.g. "0")
  - `deletedAt`: object (e.g. null)
  - `createdAt`: string (e.g. "2026-06-13T16:58:47.488Z")

## Table: SupplierTransaction
- **Record Count**: 3
- **Schema Fields**:
  - `id`: string (e.g. "cmr0qp24q000iuet4froh9jmk")
  - `supplierId`: string (e.g. "cmr0qoapp000guet48j04fkbc")
  - `type`: string (e.g. "ADJUSTMENT")
  - `amount`: string (e.g. "5000")
  - `balanceBefore`: string (e.g. "0")
  - `balanceAfter`: string (e.g. "5000")
  - `purchaseId`: object (e.g. null)
  - `accountId`: string (e.g. "cmqrv09lh0001l704zlaqqno4")
  - `reference`: object (e.g. null)
  - `notes`: string (e.g. "")
  - `createdById`: string (e.g. "cmq7kgoml0002l504yg2n1dza")
  - `createdAt`: string (e.g. "2026-06-30T00:00:00.000Z")

## Table: Sale
- **Record Count**: 57
- **Schema Fields**:
  - `id`: string (e.g. "cmrm2i7b40001ib0467n568t8")
  - `warehouseId`: object (e.g. null)
  - `userId`: string (e.g. "cmq2fdh4z0004uel0pq0fituq")
  - `customerId`: string (e.g. "cmrdm68bn0000jv04gc31vau9")
  - `channel`: string (e.g. "POS")
  - `status`: string (e.g. "COMPLETED")
  - `subtotal`: string (e.g. "1100")
  - `discount`: string (e.g. "0")
  - `total`: string (e.g. "1100")
  - `paid`: string (e.g. "1100")
  - `due`: string (e.g. "0")
  - `notes`: object (e.g. null)
  - `editedById`: object (e.g. null)
  - `editedAt`: object (e.g. null)
  - `data`: object (e.g. {"vat":0,"attention":null,"inv)
  - `deletedAt`: object (e.g. null)
  - `createdAt`: string (e.g. "2026-06-20T00:00:00.000Z")

## Table: SaleItem
- **Record Count**: 183
- **Schema Fields**:
  - `id`: string (e.g. "cmrkfrv4d0001jt0453mb960x")
  - `saleId`: string (e.g. "cmri2f8010001kw047c1ziape")
  - `productId`: string (e.g. "cmqch3odt0003l104lz0hb2go")
  - `name`: string (e.g. "Ranger 2 Pro 2K")
  - `qty`: number (e.g. 1)
  - `price`: string (e.g. "2519")
  - `cost`: string (e.g. "2280")
  - `discount`: string (e.g. "119")
  - `warrantyMonths`: number (e.g. 11)

## Table: SaleTender
- **Record Count**: 79
- **Schema Fields**:
  - `id`: string (e.g. "cms09bq6q0005i904r9qcjuqi")
  - `saleId`: string (e.g. "cmryzfelp0002l20452jo0rof")
  - `type`: string (e.g. "CASH")
  - `accountId`: string (e.g. "cmqcc2tnb0004l704ynjmwukt")
  - `amount`: string (e.g. "2400")
  - `ref`: object (e.g. null)

## Table: HeldSale
- **Record Count**: 0

## Table: Purchase
- **Record Count**: 31
- **Schema Fields**:
  - `id`: string (e.g. "cmqoovbjh0000ld05zwmmdxsx")
  - `supplierId`: string (e.g. "cmqcpyije0001l204wil79g99")
  - `warehouseId`: string (e.g. "seed-wh-hq")
  - `invoiceNo`: string (e.g. "PO-CMQOOVBJ")
  - `subtotal`: string (e.g. "17000")
  - `discount`: string (e.g. "0")
  - `extraCost`: string (e.g. "0")
  - `total`: string (e.g. "17000")
  - `paid`: string (e.g. "17000")
  - `due`: string (e.g. "0")
  - `notes`: string (e.g. "{\"_m\":{\"status\":\"Ordered)
  - `createdAt`: string (e.g. "2026-06-22T04:01:51.149Z")

## Table: PurchaseItem
- **Record Count**: 176
- **Schema Fields**:
  - `id`: string (e.g. "cms3596yz0003l7048sv04xm9")
  - `purchaseId`: string (e.g. "cms3596yz0001l704ae2blffo")
  - `productId`: string (e.g. "cms3570q80004l704qj6ayyr2")
  - `qty`: number (e.g. 1)
  - `cost`: string (e.g. "1850")
  - `name`: string (e.g. "Tenda Router AC7 1200Mbps Dua)
  - `salePrice`: string (e.g. "2200")
  - `serials`: object (e.g. ["E8444011545000939"])
  - `warrantyStartDate`: string (e.g. "2026-07-27T00:00:00.000Z")
  - `warrantyMonths`: number (e.g. 12)

## Table: PurchaseTender
- **Record Count**: 31
- **Schema Fields**:
  - `id`: string (e.g. "cmqcowf2s000kla0481xnes2r")
  - `purchaseId`: string (e.g. "cmqcowf2r0002la04d09o5q4f")
  - `type`: string (e.g. "CASH")
  - `accountId`: string (e.g. "cmqcc2tnb0004l704ynjmwukt")
  - `amount`: string (e.g. "95130")
  - `ref`: object (e.g. null)

## Table: SupplierPayment
- **Record Count**: 0

## Table: RestockOrder
- **Record Count**: 2
- **Schema Fields**:
  - `id`: string (e.g. "cmraafvtf0000ueos3jwmu0s7")
  - `roNumber`: string (e.g. "RO-00001")
  - `status`: string (e.g. "DRAFT")
  - `note`: object (e.g. null)
  - `createdAt`: string (e.g. "2026-07-07T06:48:52.178Z")
  - `confirmedAt`: object (e.g. null)

## Table: RestockItem
- **Record Count**: 120
- **Schema Fields**:
  - `id`: string (e.g. "cmraafvth0002ueosrg1dl90n")
  - `restockOrderId`: string (e.g. "cmraafvtf0000ueos3jwmu0s7")
  - `productId`: string (e.g. "cmqcezn8m0008la04b2gatq58")
  - `name`: string (e.g. "Color Cam")
  - `currentStock`: number (e.g. 0)
  - `minStock`: number (e.g. 2)
  - `suggestedQty`: number (e.g. 7)
  - `costPrice`: string (e.g. "0")

## Table: SerialNumber
- **Record Count**: 297
- **Schema Fields**:
  - `id`: string (e.g. "cmqcowlh40014la04t8ym0771")
  - `productId`: string (e.g. "cmqcj4xr40008js04xhljkxh1")
  - `serial`: string (e.g. "D011-2603216513")
  - `status`: string (e.g. "SOLD")
  - `saleItemId`: string (e.g. "cmrm2i7b40003ib047e2tbsj3")
  - `purchaseItemId`: object (e.g. null)
  - `soldAt`: string (e.g. "2026-07-15T12:40:02.279Z")
  - `warrantyExpiryDate`: string (e.g. "2027-06-15T12:40:02.279Z")
  - `warehouseId`: object (e.g. null)
  - `createdAt`: string (e.g. "2026-06-13T18:29:36.568Z")

## Table: FinancialAccount
- **Record Count**: 6
- **Schema Fields**:
  - `id`: string (e.g. "cmqrv09lh0001l704zlaqqno4")
  - `name`: string (e.g. "IFIC")
  - `type`: string (e.g. "BANK")
  - `parentId`: object (e.g. null)
  - `openingBalance`: string (e.g. "2000")
  - `balance`: string (e.g. "-8480")
  - `archived`: boolean (e.g. false)
  - `createdAt`: string (e.g. "2026-06-24T09:16:58.133Z")

## Table: AccountTransfer
- **Record Count**: 4
- **Schema Fields**:
  - `id`: string (e.g. "cmsee3o3n0001uen0hsu3in0j")
  - `fromAccountId`: string (e.g. "cmqrv09lh0001l704zlaqqno4")
  - `toAccountId`: string (e.g. "cmqcc2tnb0004l704ynjmwukt")
  - `amount`: string (e.g. "500")
  - `notes`: string (e.g. "")
  - `date`: string (e.g. "2026-08-04T08:22:07.811Z")

## Table: Expense
- **Record Count**: 0

## Table: StockAdjustment
- **Record Count**: 0

## Table: Transfer
- **Record Count**: 0

## Table: TransferItem
- **Record Count**: 0

## Table: AuditLog
- **Record Count**: 752
- **Schema Fields**:
  - `id`: string (e.g. "cmqcbjhwp0002l7043orvjfbu")
  - `userId`: string (e.g. "cmq7kgoml0002l504yg2n1dza")
  - `entity`: string (e.g. "Product")
  - `entityId`: string (e.g. "cmqcbjg5s0001l704y4f23usr")
  - `action`: string (e.g. "CREATE")
  - `diff`: object (e.g. {"sku":"SKU-10220","name":"Dah)
  - `createdAt`: string (e.g. "2026-06-13T12:15:30.410Z")

## Table: Notification
- **Record Count**: 489
- **Schema Fields**:
  - `id`: string (e.g. "cmqnicehy0000uebwj3ty4vw6")
  - `type`: string (e.g. "low_stock")
  - `title`: string (e.g. "Out of stock")
  - `message`: string (e.g. "AC 1200 Dual Band Gigabit Rou)
  - `read`: boolean (e.g. true)
  - `link`: object (e.g. null)
  - `createdAt`: string (e.g. "2026-06-21T08:11:24.645Z")

## Table: CashShift
- **Record Count**: 0

## Table: ProductReview
- **Record Count**: 0

## Table: HeroSlide
- **Record Count**: 2
- **Schema Fields**:
  - `id`: string (e.g. "cmri641mo0003l504k03rfcbs")
  - `headline`: string (e.g. "hi")
  - `highlight`: string (e.g. "")
  - `sub`: string (e.g. "")
  - `cta1`: string (e.g. "Shop Now")
  - `cta1Link`: string (e.g. "/shop")
  - `cta2`: string (e.g. "")
  - `cta2Link`: string (e.g. "")
  - `imgUrl`: string (e.g. "https://res.cloudinary.com/da)
  - `gradient`: string (e.g. "")
  - `position`: number (e.g. 0)
  - `isActive`: boolean (e.g. true)
  - `createdAt`: string (e.g. "2026-07-12T19:09:49.480Z")
  - `updatedAt`: string (e.g. "2026-07-12T19:09:49.480Z")

## Table: SiteConfig
- **Record Count**: 3
- **Schema Fields**:
  - `id`: string (e.g. "cmqxhv3ea0001ues485jh5p2q")
  - `key`: string (e.g. "footer")
  - `value`: object (e.g. {"aboutText":"অরিজিনাল ব্র্যান)
  - `createdAt`: string (e.g. "2026-06-28T07:55:38.866Z")
  - `updatedAt`: string (e.g. "2026-06-28T08:31:56.880Z")

## Table: WarrantyClaim
- **Record Count**: 0

## Table: SystemUpdate
- **Record Count**: 0

