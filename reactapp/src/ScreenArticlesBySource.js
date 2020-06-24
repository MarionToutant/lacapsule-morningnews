import React, {useState, useEffect} from 'react';
import './App.css';
import { Card, Icon, Modal} from 'antd';
import Nav from './Nav'
import {connect} from 'react-redux'

const { Meta } = Card;

function ScreenArticlesBySource(props) {

  const [articleList, setArticleList] = useState([])
  const [articleWishList, setArticleWishList] = useState([])

  const [visible, setVisible] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // RECUPERATION ARTICLES

  useEffect(() => {
    const findArticles = async() => {
      
      const data = await fetch('/articles', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `sourcesFromFront=${props.match.params.id}`
      })
      
      const body = await data.json()
      setArticleList(body) 

    }

    findArticles()    
  },[])

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

  // ADD MY ARTICLES IN DB

  var handleClickAddArticle = async (article) => {
   
    setArticleWishList([...articleWishList, {title: article.title, description: article.description, content: article.content, img: article.urlToImage}])
    await fetch('/wishlist-article', {
      method: 'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded'},
      body: `title=${article.title}&description=${article.description}&content=${article.content}&img=${article.urlToImage}&token=${props.token}`
    });
  }

  // CALLBACK

  return (
    <div>
         
            <Nav/>

            <div className="Banner"/>

            <div className="Card">
              {articleList.map((article,i) => (
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
                      src={article.urlToImage}
                  />
                  }
                  actions={[
                      <Icon type="read" key="ellipsis2" onClick={() => showModal(article.title,article.content)} />,
                      <Icon type="like" key="ellipsis" onClick={()=> {props.addToWishList(article); handleClickAddArticle(article)}} />
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
  return {token: state.token}
}

function mapDispatchToProps(dispatch){
  return {
    addToWishList: function(article){
      dispatch({type: 'addArticle',
        articleLiked: article
      })
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScreenArticlesBySource)
