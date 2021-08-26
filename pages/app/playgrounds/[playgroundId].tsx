/* eslint-disable react-hooks/rules-of-hooks */
import Note from '@/components/note/Note';
import NoteTag from '@/components/note/NoteTag';
import fetcher from '@/lib/fetcher';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { CodePlayground, notes } from '@prisma/client';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { useEffect } from 'react';
import Head from 'next/head';
import EditPopover from '@/components/note/EditPopover';
import { HiOutlineCog, HiOutlineMenuAlt1 } from 'react-icons/hi';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Fab, Action } from 'react-tiny-fab';
import 'react-tiny-fab/dist/styles.css';
import Link from 'next/link';
import MenuBarTooltip from '@/components/note/Tooltip';
import * as Checkbox from '@radix-ui/react-checkbox';
import { HiCheck } from 'react-icons/hi';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import DashboardLayout from 'layouts/DashboardLayout';

const index = () => {
  const router = useRouter();
  const {
    data: playground,
    mutate,
    error,
  } = useSWR<CodePlayground>(
    `/api/playground/get-playground/?playgroundId=${router.query.playgroundId}`,
    fetcher
  );
  useEffect(() => {
    window.onbeforeunload = function () {
      return '';
    };
  }, []);

  let [isOpen, setIsOpen] = useState(false);
  const [isPlaygroundIdPublic, setIsPlaygroundIdPublic] = useState(
    playground?.isPublic
  );

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsMenuModalOpen(false);
    setIsOpen(true);
  }

  const [isMenuModalOpen, setIsMenuModalOpen] = useState<boolean>(false);
  // const [html, setHtml] = useState(playground?.html);
  // const [css, setCss] = useState(playground?.css);
  // const [js, setJs] = useState(playground?.js);

  function closeMenuModal() {
    setIsMenuModalOpen(false);
  }

  function openMenuModal() {
    setIsOpen(false);
    setIsMenuModalOpen(true);
  }

  const [frameLoaded, setFrameLoaded] = useState(false);

  useEffect(() => {
    // @ts-ignore
    const editor: HTMLIFrameElement =
      document.getElementById('paperclip-editor');
    if (frameLoaded) {
      editor.contentWindow.postMessage(
        {
          sentByPaperclip: true,
          initialHTML: playground?.html,
          initialCss: playground?.css,
          initialJs: playground?.js,
        },
        '*'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameLoaded]);

  useEffect(() => {
    window.onmessage = (event) => {
      if (event.data.sentToPaperclip) {
        // setHtml(event.data.htmlCode);
        // setCss(event.data.cssCode);
        // setJs(event.data.jsCode);
        // alert('Code updated');

        if (event.data.saveCode) {
          const updateReq = axios.post(
            `/api/playground/update-playground/?playgroundId=${router.query.playgroundId}`,
            {
              html: event.data.htmlCode,
              css: event.data.cssCode,
              js: event.data.jsCode,
              playgroundId: playground?.id,
            }
          );
          toast.promise(updateReq, {
            loading: `Saving playground`,
            error: 'Error saving playground',
            success: `Saved playground!!`,
          });
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='w-screen h-screen'>
      <Head>
        <title>{playground?.playgroundName} | Paperclip</title>
      </Head>
      {/* {JSON.stringify(note, null, 2)} */}
      {playground && (
        <iframe
          src='http://localhost:3001'
          frameBorder='0'
          allow='clipboard-read; clipboard-write; allow-popups; allow-downloads; allow-modals;'
          id='paperclip-editor'
          onLoad={() => setFrameLoaded(true)}
          className='!w-screen h-full'>
          Loading...
        </iframe>
      )}
      <Toaster />
    </div>
  );
};

export default withPageAuthRequired(index);
