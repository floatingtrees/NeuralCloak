import { useForm, SubmitHandler } from 'react-hook-form';
import React, { useState } from 'react';
import axios from 'axios';

export default function Upload() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit: SubmitHandler = async (data) => {
    const formData = new FormData();
    formData.append('files', data.files);
    const reader = new FileReader();
    reader.readAsDataURL(data.files[0]);
    await fetch('/api/upload', {
        method: 'POST',
        body: reader.result,
    });    
    console.log(reader.result)

    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="file" multiple={true} />
    </form>
  );
}
