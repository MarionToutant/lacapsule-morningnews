import React, {useState, useEffect} from 'react';
import './App.css';
import { Card, Icon, Modal} from 'antd';
import Nav from './Nav'

import {connect} from 'react-redux'

const { Meta } = Card;

function ScreenMyArticles(props) {
  const [visible, setVisible] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [wishlist, setWishlist] = useState([])

  // MODAL

  var showModal = (title, content) => {
    setVisible(true)
    setTitle(title)
    setContent(content)

  }
  var handleOk = e => {
    console.log(e)
    setVisible(false)
  }
  var handleCancel = e => {
    console.log(e)
    setVisible(false)
  }

  // NO ARTICLE

  var noArticles
  if(props.myArticles === 0){
    noArticles = <div style={{marginTop:"30px"}}>No Articles</div>
  }

  // GET WISHLIST FROM BACKEND & DB

  useEffect( () => {
    async function loadData(){
       var response = await fetch('/wishlist-article');
       var jsonResponse = await response.json();
       var wishlistFromDB = jsonResponse.wishlist.map((article,i) => {
         return {title: article.title, description: article.description, content: article.content, img: article.img}
       })
       setWishlist(wishlistFromDB);
    } 
    loadData()
 }, []);

 // DELETE ARTICLES FROM WISHLIST IN DB

  var handleClickDeleteArticle = async (title) => {
    setWishlist(wishlist.filter(object => object.title !== title))
    await fetch(`/wishlist-article/${title}`, {
      method: 'DELETE'
    });

  }

  // CALLBACK

  return (
    <div>
         
            <Nav/>

            <div className="Banner"/>

            {noArticles}

            <div className="Card">
    

            {wishlist.map((article,i) => (
                <div key={i} style={{display:'flex',justifyContent:'center'}}>

                  <Card
                    
                    style={{ 
                    width: 300, 
                    margin:'15px', 
                    display:'flex',
                    flexDirection: 'column',
                    justifyContent:'space-between' }}
                    cover={
                    <img
                        alt="example"
                        src={article.img}
                    />
                    }
                    actions={[
                        <Icon type="read" key="ellipsis2" onClick={() => showModal(article.title,article.content)} />,
                        <Icon type="delete" key="ellipsis" onClick={() => {props.deleteToWishList(article.title); handleClickDeleteArticle(article.title)}} />
                    ]}
                    >

                    <Meta
                      title={article.title}
                      description={article.description}
                    />

                  </Card>
                  <Modal
                    title={title}
                    visible={visible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                  >
                    <p>{title}</p>
                  </Modal>

                </div>

              ))}



       

                

             </div>
      
 

      </div>
  );
}

function mapStateToProps(state){
  return {myArticles: state.wishList}
}

function mapDispatchToProps(dispatch){
  return {
    deleteToWishList: function(articleTitle){
      dispatch({type: 'deleteArticle',
        title: articleTitle
      })
    }
  }
}



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScreenMyArticles);
