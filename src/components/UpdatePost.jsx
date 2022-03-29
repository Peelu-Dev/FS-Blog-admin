import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPost, updatePost } from '../api/post';
import { useNotification } from '../context/NotificationProvider';
import PostForm from './PostForm';
import NotFound from './NotFound'

export default function UpdatePost() {
  const {slug} = useParams();
  const {updateNotification} = useNotification();
  const [postInfo,setPostInfo] = useState(null);
  const [notFound,setNotFound] = useState(false);
  const [busy,setBusy] = useState(false);

 

  const fetchPost = async () =>{
    const {error,post} = await getPost(slug)
    if(error) {
      setNotFound(true)
      return updateNotification('error',error)
    }
    setPostInfo({...post, tags:post.tags?.join(', ')})
  }

  useEffect(() => {
    fetchPost();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const handleSubmit = async(data)=>{
    setBusy(true)
    const {error,post} = await updatePost(postInfo.id,data);
    setBusy(false)
    if(error) return updateNotification(error);

    setPostInfo({...post , tags : post.tags?.join(', ')})
  }

  if(notFound) return <NotFound/>
  return (
    <PostForm initialPost={postInfo} postBtnTitle='Update' onSubmit={handleSubmit} busy={busy} resetAfterSubmit />
  )
}
