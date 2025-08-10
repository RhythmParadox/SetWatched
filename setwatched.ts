/// <reference path="./plugin.d.ts" />
/// <reference path="./system.d.ts" />
/// <reference path="./app.d.ts" />
/// <reference path="./core.d.ts" />

import { $app } from "./app";

function init() {
    // Everything is magically typed!

    $ui.register((ctx) => {
        const tray = ctx.newTray({
            withContent: true,
            iconUrl: 'https://seanime.rahim.app/logo_2.png',
        })

        const sw_episode_card = ctx.action.newEpisodeCardContextMenuItem({
            label: "Set Watched",
        })

        const sw_media_card = ctx.action.newMediaCardContextMenuItem({
            label: "Set Watched",
        })

        const sw_anime_card = ctx.action.newAnimePageDropdownItem({
            label: "Set Watched",
        })

        sw_media_card.mount()
        sw_episode_card.mount()
        sw_anime_card.mount()

        const anime_rating_ref = ctx.fieldRef<string>('0')
        sw_media_card.onClick((e) => {
            const id = e.media.id
            const max_eps = e.media.episodes
            $store.set('sw_anime_name', e.media.title.english)
            $store.set('sw_anime_id', id)
            $store.set('sw_anime_ep', max_eps)
            tray.open()
        })

        sw_anime_card.onClick((e) => {
            console.log(e)
            const id = e.media.id
            const max_eps = e.media.episodes
            $store.set('sw_anime_name', e.media.title.english)
            $store.set('sw_anime_id', id)
            $store.set('sw_anime_ep', max_eps)
            tray.open()
        })

        sw_episode_card.onClick((e) => {
            const id = e.episode.baseAnime.id
            const max_eps = e.episode.baseAnime.episodes
            if (e.episode.progressNumber == max_eps) {
                $store.set('sw_anime_name', e.episode.baseAnime.title.english)
                $store.set('sw_anime_id', id)
                $store.set('sw_anime_ep', max_eps)
                tray.open()
            }
            else {
                $anilist.updateEntryProgress(id,
                    e.episode.progressNumber,
                    max_eps
                )
            }

            $anilist.refreshAnimeCollection()
            ctx.toast.success('Watched episode ' + e.episode.progressNumber + ' of ' + e.episode.baseAnime.title.english)
        })

        ctx.registerEventHandler('rating-submitted', () => {
            const anime_id = $store.get('sw_anime_id')
            const anime_name = $store.get('sw_anime_name')
            const anime_episode = +$store.get('sw_anime_ep')
            const rating = +anime_rating_ref.current

            $anilist.updateEntry(anime_id,
                'COMPLETED',
                rating * 10,
                anime_episode,
                undefined,
                undefined
            )

            ctx.toast.success("Rated " + anime_name + " a " + rating)
            $anilist.refreshAnimeCollection()
            tray.close()
        })

        tray.render(() => {
            const anime_name = $store.get('sw_anime_name')

            return tray.stack({
                items: [
                    tray.text('What is your rating for ' + anime_name + '?'),
                    tray.input('Rating', {
                        placeholder: '0-10',
                        fieldRef: anime_rating_ref,
                    }),
                    tray.button('Submit Rating', {
                        intent: 'primary',
                        onClick: 'rating-submitted'
                    })
                ]
            })
        })
    })
}