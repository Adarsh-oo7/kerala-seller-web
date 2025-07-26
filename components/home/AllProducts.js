import React from "react"
import ProductCard from "../common/ProductCard"
import FilterBar from "../common/FilterBar"


const AlProducts = [
  {
    id: 1,
    title: "Floral Maxi Dress",
    price: 1299,
    image: "https://i5.walmartimages.com/seo/Jungle-Square-Neck-Dress-Back-Lacing-Backless-Dress-Elegant-Beach-Party-Dress-Korean-Dresses-For-Women-nbsp-Party-Dress-6Xl_a7bf93b4-df6b-407b-a549-cb862243085b.f6c113908bff336dd218d71aefbb72c9.jpeg",
  },
  {
    id: 2,
    title: "Co-ord Set Blue",
    price: 1499,
    image: "https://i.pinimg.com/originals/d1/3b/d1/d13bd12532cd96ccb6a89a29ddfdd174.jpg",
  },
  {
    id: 3,
    title: "Red Party Gown",
    price: 1799,
    image: "https://i.pinimg.com/736x/8f/36/58/8f3658235ee4a28750ab42360848e336.jpg",
  },
  {
    id: 4,
    title: "Casual Kurti",
    price: 899,
    image: "https://slimages.macysassets.com/is/image/MCY/products/1/optimized/27633101_fpx.tif?op_sharpen=1&wid=700&hei=855&fit=fit,1",
  },
  {
    id: 5,
    title: "Silk Salwar Suit",
    price: 1599,
    image: "https://tse3.mm.bing.net/th/id/OIP.YZS0ahAMr3Zs1e_uCJz5CgHaJ4?pid=Api&P=0&h=220",
  },
]

export default function AllProducts() {
  return (
    <>
    <section className="featured-products">
      <div className="header-row">
        <h2 className="section-title">Products</h2>
        <button className="view-all-btn">View All</button>
      </div>
<FilterBar/>
      <div className="featured-grid">
        {AlProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
    </>
  )
}
