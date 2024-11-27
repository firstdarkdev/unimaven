'use client'
import 'highlight.js/styles/atom-one-dark.min.css'
import { Button, TextInput } from 'flowbite-react'
import { useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { toast, ToastContainer } from 'react-toastify'

export default function Home() {
    const [value, setValue] = useState<string>('')
    const [mavenString, setMavenString] = useState<string>('')

    const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value)
    }

    const getCurseMavenString = async () => {
        const data = await fetch(`/resolve_cf_slug/${value}`)

        if (data) {
            setMavenString(await data.text())
        }
    }

    const getMavenString = async () => {
        setMavenString('')
        let hasMatched = false

        if (value == '') return

        if (value.includes('curseforge.com')) {
            await getCurseMavenString()
            hasMatched = true
        }

        if (value.includes('modrinth.com')) {
            const regex = /mod\/([^/]+)\/version\/([^/]+)/
            const match = value.match(regex)

            if (match) {
                setMavenString(`unimaven.modrinth:${match[1]}:${match[2]}`)
                hasMatched = true
            }
        }

        if (value.includes('nightbloom.cc')) {
            const regex = /project\/([^/]+)\/files\/([^/]+)/
            const match = value.match(regex)

            if (match) {
                setMavenString(`unimaven.nightbloom:${match[1]}:${match[2]}`)
                hasMatched = true
            }
        }

        if (value.includes('github.com')) {
            const regex = /github\.com\/([^/]+)\/([^/]+)\/releases\/tag\/([^/]+)/
            const match = value.match(regex)

            if (match) {
                const url = await getFirstJarFile(match[1], match[2], match[3])

                if (url) {
                    setMavenString(`unimaven.github-${match[1]}:${match[2]}:${match[3]}+${url}`)
                    hasMatched = true
                }
            }
        }

        if (!hasMatched) {
            toast("Sorry, we couldn't find any maven information for that url", {
                position: 'top-right',
                theme: 'colored',
                type: 'error',
            })
        }
    }

    const getFirstJarFile = async (username: string, repo: string, releaseTag: string) => {
        try {
            // GitHub API URL to get the release details
            const response = await fetch(`https://api.github.com/repos/${username}/${repo}/releases/tags/${releaseTag}`)

            if (!response) return null

            const json = await response.json()
            // Filter the assets to find the first .jar file
            const jarFile = json.assets.find((asset: { name: string }) => asset.name.endsWith('.jar'))

            if (jarFile) {
                return jarFile.name.replace('.jar', '')
            }
        } catch (error) {
            console.error('Error fetching release data:', error)
        }

        return null
    }

    return (
        <div className={'w-full h-full flex items-center justify-center p-10'}>
            <ToastContainer />
            <div className={'container text-center m-width'}>
                <h1 className={'font-bold text-5xl mb-3'}>UniMaven</h1>
                <p className={'mb-10'}>
                    A lightweight virtual maven for CurseForge, Modrinth, GitHub Releases and NightBloom
                </p>

                <p className={'text-left mb-1 text-sm ml-0.5'}>Enter a File Link below, to get the maven information</p>
                <div className={'flex gap-1 justify-between'}>
                    <TextInput
                        id='text'
                        type='text'
                        placeholder='https://www.curseforge.com/minecraft/mc-mods/craterlib/files/5834539'
                        required
                        className={'w-full'}
                        onChange={onInputChange}
                    />
                    <Button onClick={() => getMavenString()}>Get</Button>
                </div>
                <p className={'text-sm mt-2'}>
                    Supported Platforms: CurseForge, Modrinth, GitHub Releases and NightBloom
                </p>
                <pre className={'no-more-tailwind mt-2'}>
                    <code className={'text-left hljs'}>
                        {`Example Links:
              
https://nightbloom.cc/project/sdlink/files/1sGOH6Zr
https://modrinth.com/mod/craterlib/version/zilayLM6
https://www.curseforge.com/minecraft/mc-mods/craterlib/files/5834539
https://github.com/CaffeineMC/sodium/releases/tag/mc1.20.1-0.5.11
`}
                    </code>
                </pre>

                {mavenString && (
                    <div className={'text-left mt-5'}>
                        <pre className={'no-more-tailwind'}>
                            <code className={'hljs language-groovy'}>
                                {`repositories {
  // Existing repositories

  // Add
  maven {
    url = "https://unimaven.cc"
  }
}`}
                            </code>
                        </pre>
                        <pre className={'no-more-tailwind mt-2'}>
                            <code className={'hljs language-groovy'}>
                                {`dependencies {
 // Existing Dependencies
 
 // For Forge/NeoForge
 implementation(fg.deobf("${mavenString}"))
 
 // For Fabric/Quilt
 modImplementation("${mavenString}")
}`}
                            </code>
                        </pre>
                    </div>
                )}

                <br />
                <br />
                <p className={'text-sm'}>
                    Created by HypherionSA. Licensed under GPL-3.0. View{' '}
                    <a href={'https://github.com/firstdarkdev/unimaven'} className={'no-more-tailwind'}>
                        Source Code
                    </a>
                </p>
                <br />
            </div>
        </div>
    )
}
