import React, { useEffect, useState } from 'react'
import { ImSpinner11, ImEye, ImFilePicture, ImFileEmpty, ImSpinner3 } from 'react-icons/im'
import { uploadImage } from '../api/post';
import { useNotification } from '../context/NotificationProvider';
import MarkDownHint from './MarkDownHint';
import PostView from './PostView';



export const defaultPost = {
  title:'',
  thumbnail:'',
  featured:false,
  content:'',
  tags:'',
  meta:''
}

// postBtnTitle,
export default function PostForm({initialPost,busy,postBtnTitle, onSubmit, resetAfterSubmit}) { 
  const [postInfo,setPostInfo] = useState({...defaultPost});
  const [selectedThumbnailUrl,setSelectedThumbnailUrl] = useState('')
  const [imageUrlToCopy,setImageUrlToCopy] = useState('');
  const [imageUploading,setImageUploading] = useState(false);
  const [displayMarkdownHint,setDisplayMarkdownHint] = useState(false)
  const [showDeviceView,setShowDeviceView] = useState(false)
  

  const {updateNotification} = useNotification()

  useEffect(() => {
    if(initialPost){
      setPostInfo({...initialPost})
      setSelectedThumbnailUrl(initialPost?.thumbnail)
    }
    
    return () => {
      if(resetAfterSubmit) resetForm()
    }
  }, [initialPost,resetAfterSubmit])
  

  const handleChange = ({target}) => {
    const {value,name,checked} = target;

    if(name === 'thumbnail'){
      const file = target.files[0];
      if(!file.type?.includes('image')){
        return alert('This is not an image!')
      }
      setPostInfo({...postInfo,thumbnail:file});
      return setSelectedThumbnailUrl(URL.createObjectURL(file));
    }

    if(name === 'featured'){ 
      localStorage.setItem('blogPost',JSON.stringify({...postInfo,featured:checked}))
      return setPostInfo({...postInfo, [name]:checked})   
    }

    if(name === 'tags'){ 
      const newTags = tags.split(',');
      if(newTags.length > 5)
      updateNotification('warning','Only Five Tags can be selected')
    }

    if(name === 'meta' && meta.length >= 150){ 
      return setPostInfo({...postInfo, meta: value.substring(0,149)})
    }

    const newPost = {...postInfo, [name]:value}

    setPostInfo({...newPost})
    localStorage.setItem('blogPost',JSON.stringify(newPost))
  }

  const handleImageUpload = async ({target})=> {
    if(imageUploading) return;

    const file = target.files[0];
      if(!file.type?.includes("image")){
        return updateNotification('error','This is not an image!')
      }

      setImageUploading(true);
      const formData = new FormData();
      formData.append("image",file);

      const {error,image} = await uploadImage(formData);
      setImageUploading(false);
      if(error) return updateNotification('error',error)
      setImageUrlToCopy(image)
  }

  const handleOnCopy = () =>{
    const textToCopy = `![add image description ](${imageUrlToCopy})`
    navigator.clipboard.writeText(textToCopy);
  }

  const handleSubmit = (e) =>{
      e.preventDefault();
      const {title,meta,content,tags}= postInfo;
      if(!title.trim()) return updateNotification('error','Title is missing!')
      if(!content.trim()) return updateNotification('error','Content is missing!')
      if(!tags.trim()) return updateNotification('error','Tags are missing!')
      if(!meta.trim()) return updateNotification('error','Meta Description is missing!')

      const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z]/g, " ")
      .split(" ")
      .filter((item) => item.trim())
      .join('-')

      const newTags = tags
      .split(',')
      .map((item) => item.trim())
      .splice(0, 5)

      const formData = new FormData();
      const finalPost = {...postInfo, tags: JSON.stringify(newTags) , slug};
      for(let key in finalPost){
          formData.append(key, finalPost[key])
      }
      onSubmit(formData);
      // setPostInfo({...initialPost})

      

  }

  const resetForm = () => {
    setPostInfo({...defaultPost});
    localStorage.removeItem('blogPost')
  }

  const {title,featured,meta,content,tags}= postInfo;
  return (
    <>
    <form onSubmit={handleSubmit} className='p-2 flex'>
      <div className="w-9/12 space-y-3  flex flex-col h-screen">
        {/* title and submit */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-700">
            Create New Post
          </h1>
          <div className="flex items-center space-x-5">
            <button onClick={resetForm} type='button' className='flex items-center space-x-2 px-3 ring-1 ring-blue-500 rounded h-10 text-blue-500 hover:text-white hover:bg-blue-500 transition'>
              <ImSpinner11 />
              <span>Reset</span>
            </button>
            <button onClick={()=> setShowDeviceView(true)} type='button' className='flex items-center space-x-2 px-3 ring-1 ring-blue-500 rounded h-10 text-blue-500 hover:text-white hover:bg-blue-500 transition'>
              <ImEye />
              <span>View</span>
            </button>
            <button className='h-10 w-36  hover:ring-1 bg-blue-500 rounded  text-white hover:text-blue-500 hover:bg-transparent ring-blue-500 transition'>{busy ? <ImSpinner3 className='animate-spin mx-auto text-xl' /> : postBtnTitle}</button>
          </div>
        </div>
        {/* featured checkbox */}
        <div className='flex'>
          <input value={featured} id='featured' name='featured' onChange={handleChange} type="checkbox" hidden />
          <label className='flex items-center space-x-2 text-gray-700 cursor-pointer group select-none' htmlFor="featured">
            <div className='w-4 h-4 rounded-full border-2 border-gray-700 flex items-center justify-center group-hover:border-blue-500'>
              {featured && (<div className='w-2 h-2 rounded-full bg-gray-700 group-hover:bg-blue-500' />)}

            </div>
            <span className='group-hover:text-blue-500'>Featured</span>
          </label>
        </div>
        {/* title input */}

        <input onFocus={()=> setDisplayMarkdownHint(false)} value={title} name='title' onChange={handleChange} type="text" className='text-xl outline-none focus:ring-1 rounded p-2 w-full font-semibold' placeholder='Post Title' />

        {/* image input */}
        <div className="flex space-x-2">
           <div>
            <input onChange={handleImageUpload} id='image-input' type="file" hidden />
            <label htmlFor='image-input' className='flex items-center space-x-2 px-3 ring-1 ring-gray-700 rounded h-10 text-gray-700 hover:text-white hover:bg-gray-700 transition cursor-pointer'>
              <span>Place Image</span>
              {!imageUploading ? <ImFilePicture /> : <ImSpinner3 className='animate-spin' /> }
              
            </label>
          </div>

           {imageUrlToCopy &&  (<div className="flex-1 flex  justify-between bg-gray-400 rounded overflow-hidden  ">
            <input type="text" value={imageUrlToCopy} className='bg-transparent px-2 text-white w-full' disabled />

            <button type='button' onClick={handleOnCopy} className='text-xs flex flex-col items-center  justify-center  p-1 self-stretch  bg-gray-700 text-white'>
              <ImFileEmpty />
              <span>Copy</span>
            </button>
          </div>)}
        </div>


        <textarea onFocus={()=> setDisplayMarkdownHint(true)} value={content} name='content' onChange={handleChange} className='resize-none outline-none focus:ring-1 rounded p-2 w-full flex-1 font-mono tracking-wide text-lg' placeholder='## MarkDown'></textarea>


        <div>
          {/* tags input */}
          <label className='to-gray-500' htmlFor="tags">Tags</label>
          <input value={tags} name='tags' onChange={handleChange} id='tags' type="text" className=' outline-none focus:ring-1 rounded p-2 w-full ' placeholder='Tag One, Tag Two' />
        </div>
        <div>
          {/* meta description input */}
  <label className='to-gray-500' htmlFor="meta">Meta Description {meta?.length} / 150  </label>
          <textarea value={meta} name='meta' onChange={handleChange} id='meta' className='resize-none outline-none focus:ring-1 rounded p-2 w-full h-28 ' placeholder='Meta Description'></textarea>
        </div>
      </div>


      <div className="w-1/4 px-2 relative">
        <h1 className='text-xl font-semibold text-gray-700 mb-2'>Thumbnail</h1>
        <div>
          <input name='thumbnail' onChange={handleChange} id='thumbnail' type="file" hidden />
          <label className='cursor-pointer' htmlFor="thumbnail">
           {selectedThumbnailUrl ? (<img src={selectedThumbnailUrl} className='aspect-video shadow-sm rounded' alt="" />) : <div className="border border-dashed border-gray-500 aspect-video text-gray-500 flex flex-col justify-center items-center ">
              <span>Select Thumbnail</span>
              <span className='text-xs'>Recommended Size</span>
              <span className='text-xs'>1280 * 720 </span>
            </div>}
          </label>
        </div>
        {/* markdown rules */}
        <div className=" absolute top-1/2 -translate-y-1/2 ">
            {displayMarkdownHint && <MarkDownHint/>}
        </div>
        </div>

    </form>
    <PostView visible={showDeviceView} title={title} content={content} thumbnail={selectedThumbnailUrl} 
    onClose={()=> setShowDeviceView(false)}
    />
    </>
  )
}
